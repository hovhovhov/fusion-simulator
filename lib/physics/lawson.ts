import { FUEL_PROFILES, type FuelKey } from "@/lib/physics/fuels";

export type LawsonPoint = {
  temperatureKeV: number;
  requiredNttau: number;
};

export function lawsonThresholdForFuel(fuel: FuelKey): number {
  return FUEL_PROFILES[fuel].ignitionNttau;
}

export function calculateNttau(
  densityPerM3: number,
  temperatureKeV: number,
  confinementTimeS: number,
): number {
  return densityPerM3 * temperatureKeV * confinementTimeS;
}

export function lawsonCurveForFuel(fuel: FuelKey): LawsonPoint[] {
  const threshold = lawsonThresholdForFuel(fuel);
  const points: LawsonPoint[] = [];

  for (let temperatureKeV = 2; temperatureKeV <= 200; temperatureKeV += 2) {
    const temperaturePenalty =
      temperatureKeV < 12
        ? (12 / temperatureKeV) ** 1.25
        : temperatureKeV > 40
          ? (temperatureKeV / 40) ** 0.45
          : 1;

    points.push({
      temperatureKeV,
      requiredNttau: threshold * temperaturePenalty,
    });
  }

  return points;
}
