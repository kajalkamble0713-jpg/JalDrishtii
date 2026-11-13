import { useState, useEffect } from 'react';
import { DistrictData } from '../types';
import { DISTRICTS_DATA as FALLBACK_DATA } from '../data/jaldrishtiData';

export const useLiveEnvironmentalData = () => {
  const [districtsData, setDistrictsData] = useState<DistrictData[]>(FALLBACK_DATA);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveWeatherData = async () => {
      try {
        // Fast initial render with complete 119 districts
        const districtsMap = new Map<string, DistrictData>(
          FALLBACK_DATA.map((d) => [d.id, { ...d }])
        );

        // Prioritize key Karnataka districts and top national outbreak hotspots for live weather sync
        const priorityDistricts = FALLBACK_DATA.filter(
          (d) => d.state === 'Karnataka' || d.riskTier === 'Very High' || d.riskTier === 'High'
        ).slice(0, 35); // Batched top 35 priority districts

        // Process in concurrent batches of 4 with a strict 2.5s timeout per request
        const batchSize = 4;
        for (let i = 0; i < priorityDistricts.length; i += batchSize) {
          if (!isMounted) break;
          const chunk = priorityDistricts.slice(i, i + batchSize);

          await Promise.all(
            chunk.map(async (district) => {
              let currentTemp: number | null = null;

              // 1. Backend REST API service (/api/v1/weather)
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const apiRes = await fetch(`/api/v1/weather?lat=${district.lat}&lng=${district.lng}`, {
                  signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (apiRes.ok) {
                  const apiData = await apiRes.json();
                  if (apiData?.data?.temperature2m !== undefined) {
                    currentTemp = apiData.data.temperature2m;
                  }
                }
              } catch {
                // Backend endpoint timeout or offline, try direct open-meteo with abort
              }

              // 2. Direct client fallback with timeout
              if (currentTemp === null) {
                try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 2000);
                  const url = `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lng}&current=temperature_2m,precipitation,surface_pressure&timezone=auto`;
                  const response = await fetch(url, { signal: controller.signal });
                  clearTimeout(timeoutId);
                  if (response.ok) {
                    const data = await response.json();
                    if (data?.current?.temperature_2m !== undefined) {
                      currentTemp = data.current.temperature_2m;
                    } else if (data?.current?.temperature2m !== undefined) {
                      currentTemp = data.current.temperature2m;
                    }
                  }
                } catch {
                  // Network offline or aborted, retain baseline
                }
              }

              if (currentTemp !== null && isMounted) {
                const existing = districtsMap.get(district.id);
                if (existing) {
                  const tempImpact = currentTemp > 32 ? 0.04 : 0;
                  districtsMap.set(district.id, {
                    ...existing,
                    riskScore: Math.min(1.0, existing.riskScore + tempImpact),
                    satellite: {
                      ...existing.satellite,
                      lstCelsius: currentTemp,
                    },
                  });
                }
              }
            })
          );
        }

        if (isMounted) {
          setDistrictsData(Array.from(districtsMap.values()));
          setIsLiveActive(true);
        }
      } catch (error) {
        console.warn('Live environmental sync completed with cached fallbacks:', error);
      } finally {
        if (isMounted) {
          setIsLoadingLive(false);
        }
      }
    };

    fetchLiveWeatherData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { districtsData, isLiveActive, isLoadingLive };
};
