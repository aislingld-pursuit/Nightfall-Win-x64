import express from "express";
import cors from "cors";
import path from "path";

export function startServer(port: number, staticDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check
    app.get("/api/healthz", (_req, res) => {
      res.json({ status: "ok" });
    });

    // Weather endpoint
    app.get("/api/weather", async (req, res) => {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ error: "lat and lon must be valid numbers" });
        return;
      }

      const key = process.env.OPENWEATHER_API_KEY;
      if (!key) {
        res.status(500).json({ error: "OpenWeather API key not configured" });
        return;
      }

      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
          res.status(500).json({ error: "Failed to fetch weather data" });
          return;
        }

        const data = (await response.json()) as {
          wind?: { speed?: number; deg?: number; gust?: number };
          weather?: Array<{ description?: string }>;
          main?: { temp?: number; humidity?: number };
        };

        res.json({
          windSpeed: data.wind?.speed ?? 0,
          windDeg: data.wind?.deg ?? 0,
          windGust: data.wind?.gust ?? null,
          description: data.weather?.[0]?.description ?? "unknown",
          temp: data.main?.temp ?? 0,
          humidity: data.main?.humidity ?? 0,
        });
      } catch {
        res.status(500).json({ error: "Failed to fetch weather data" });
      }
    });

    // Geocode endpoint
    app.get("/api/geocode", async (req, res) => {
      const address = (req.query.address as string | undefined)?.trim();

      if (!address) {
        res.status(400).json({ error: "address is required" });
        return;
      }

      try {
        const encoded = encodeURIComponent(address + ", New York, NY, USA");
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "NuclearEscapeRouter/1.0 (educational simulation)",
          },
        });

        if (!response.ok) {
          res.status(500).json({ error: "Geocoding service unavailable" });
          return;
        }

        const data = (await response.json()) as Array<{
          lat: string;
          lon: string;
          display_name: string;
        }>;

        if (!data || data.length === 0) {
          res.status(404).json({ error: "Address not found" });
          return;
        }

        res.json({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name,
        });
      } catch {
        res.status(500).json({ error: "Failed to geocode address" });
      }
    });

    // Escape route endpoint
    app.get("/api/escape-route", async (req, res) => {
      const { originLat, originLon, destLat, destLon } = req.query as {
        originLat: string;
        originLon: string;
        destLat: string;
        destLon: string;
      };

      if (!originLat || !originLon || !destLat || !destLon) {
        res
          .status(400)
          .json({
            error: "originLat, originLon, destLat, destLon are required",
          });
        return;
      }

      const key = process.env.GOOGLE_MAPS_KEY;
      if (!key) {
        res.status(500).json({ error: "Google Maps API key not configured" });
        return;
      }

      try {
        const origin = `${originLat},${originLon}`;
        const dest = `${destLat},${destLon}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&key=${key}`;

        const response = await fetch(url);
        const data = (await response.json()) as {
          status: string;
          routes?: Array<{
            overview_polyline?: { points?: string };
            legs?: Array<{
              distance?: { text?: string; value?: number };
              duration?: { text?: string; value?: number };
              steps?: Array<{
                html_instructions?: string;
                distance?: { text?: string };
                duration?: { text?: string };
              }>;
            }>;
          }>;
        };

        if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
          res.status(500).json({ error: "Failed to get escape route" });
          return;
        }

        const route = data.routes[0];
        const leg = route.legs?.[0];
        const steps = (leg?.steps ?? []).map((step) => ({
          instruction: (step.html_instructions ?? "").replace(/<[^>]+>/g, ""),
          distanceText: step.distance?.text ?? "",
          durationText: step.duration?.text ?? "",
        }));

        res.json({
          encodedPolyline: route.overview_polyline?.points ?? "",
          distanceText: leg?.distance?.text ?? "",
          durationText: leg?.duration?.text ?? "",
          distanceMeters: leg?.distance?.value ?? 0,
          durationSeconds: leg?.duration?.value ?? 0,
          steps,
        });
      } catch {
        res.status(500).json({ error: "Failed to get escape route" });
      }
    });

    // Serve built React app (must be after API routes)
    app.use(express.static(staticDir));
    app.use((_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });

    const server = app.listen(port, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });
}
