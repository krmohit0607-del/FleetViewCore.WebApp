/**
 * Tracksheet grid — read-only stub.
 *
 * Mirrors the legacy `TrackSheetProcessor` column layout:
 *   - Fundamentals       : RT, Date, Time, HRS, Lat, Lng
 *   - VLSFO 0.5% Sulphur : ROB / Bunkered / Corrected
 *   - LSMGO 0.1% Sulphur : ROB / Bunkered / Corrected
 *   - None               : ROB / Bunkered / Corrected
 *   - Distances          : DistR, DistO, dtg-o
 *   - Speed              : AvSpd-O
 *   - Engine             : RPM, EnginePower, Slip, Course
 *   - Cargo              : Amount
 *   - Weather Conditions : WindO, WavesO
 *   - Weather Factors    : Wind, Wave, Curr, AvgF
 *   - Rpt Sent           : W, F, I
 *
 * The grid is fed by `STUB_ROWS` for now. When the
 * `/api/voyage/{id}/tracksheet` endpoint is exposed, replace the stub
 * with the API response — every cell maps 1:1 to a `TrackRow` field so
 * the markup does not need to change.
 */

import { useSelectedVoyage } from '../data/selectedVoyage';

interface TrackRow {
  /** Report type marker (E = ETA/estimate, N = noon report). */
  rt: string;
  date: string;
  time: string;
  /** Steaming hours; blank for estimate rows. */
  hrs: number | null;
  lat: string;
  lng: string;
  // VLSFO 0.5% Sulphur
  vlsfoRob: number | null;
  vlsfoBunkered: number | null;
  vlsfoCorrected: number | null;
  // LSMGO 0.1% Sulphur
  lsmgoRob: number | null;
  lsmgoBunkered: number | null;
  lsmgoCorrected: number | null;
  // None
  noneRob: number | null;
  noneBunkered: number | null;
  noneCorrected: number | null;
  // Distances
  distR: number | null;
  distO: number | null;
  dtgO: number | null;
  // Speed
  avgSpeedO: number | null;
  // Engine
  rpm: number | null;
  enginePower: number | null;
  slip: number | null;
  course: number | null;
  // Cargo
  amount: number | null;
  // Weather conditions
  windO: string;
  wavesO: string;
  // Weather factors
  windF: number;
  waveF: number;
  currF: number;
  /** Avg factor string `W / F / C`. */
  avgF: string;
}

const STUB_ROWS: TrackRow[] = [
  {
    rt: 'E', date: '25Jun2026', time: '1200', hrs: null, lat: '0545N', lng: '15347E',
    vlsfoRob: null, vlsfoBunkered: null, vlsfoCorrected: null,
    lsmgoRob: null, lsmgoBunkered: null, lsmgoCorrected: null,
    noneRob: null, noneBunkered: null, noneCorrected: null,
    distR: null, distO: null, dtgO: null, avgSpeedO: null,
    rpm: null, enginePower: null, slip: null, course: null, amount: null,
    windO: 'W4', wavesO: 'ESE1.2', windF: 0, waveF: 0, currF: -0.49, avgF: '',
  },
  {
    rt: 'E', date: '25Jun2026', time: '1800', hrs: null, lat: '0553N', lng: '15256E',
    vlsfoRob: null, vlsfoBunkered: null, vlsfoCorrected: null,
    lsmgoRob: null, lsmgoBunkered: null, lsmgoCorrected: null,
    noneRob: null, noneBunkered: null, noneCorrected: null,
    distR: null, distO: null, dtgO: null, avgSpeedO: null,
    rpm: null, enginePower: null, slip: null, course: null, amount: null,
    windO: 'WNW3', wavesO: 'NNE1.2', windF: 0, waveF: 0, currF: -0.42, avgF: '',
  },
  {
    rt: 'E', date: '26Jun2026', time: '0000', hrs: null, lat: '0601N', lng: '15204E',
    vlsfoRob: null, vlsfoBunkered: null, vlsfoCorrected: null,
    lsmgoRob: null, lsmgoBunkered: null, lsmgoCorrected: null,
    noneRob: null, noneBunkered: null, noneCorrected: null,
    distR: null, distO: null, dtgO: null, avgSpeedO: null,
    rpm: null, enginePower: null, slip: null, course: null, amount: null,
    windO: 'NW2', wavesO: 'NE1.1', windF: 0, waveF: 0, currF: -0.36, avgF: '',
  },
  {
    rt: 'N', date: '26Jun2026', time: '0300', hrs: 25.0, lat: '0604N', lng: '15138E',
    vlsfoRob: 460.25, vlsfoBunkered: 0, vlsfoCorrected: 0,
    lsmgoRob: 77.2, lsmgoBunkered: 0, lsmgoCorrected: 0,
    noneRob: 0, noneBunkered: 0, noneCorrected: 0,
    distR: 217.0, distO: 216.7, dtgO: 1839.7, avgSpeedO: 8.7,
    rpm: 83.03, enginePower: 2567.0, slip: 22.56, course: 278, amount: 0,
    windO: 'NW2', wavesO: 'NE1.1', windF: 0, waveF: 0, currF: -0.35, avgF: '-0.04 / -0.02 / -0.41',
  },
  {
    rt: 'N', date: '27Jun2026', time: '0300', hrs: 24.0, lat: '0638N', lng: '14750E',
    vlsfoRob: 447.86, vlsfoBunkered: 0, vlsfoCorrected: 0,
    lsmgoRob: 77.1, lsmgoBunkered: 0, lsmgoCorrected: 0,
    noneRob: 0, noneBunkered: 0, noneCorrected: 0,
    distR: 230.0, distO: 230.0, dtgO: 1770.5, avgSpeedO: 9.6,
    rpm: 83.01, enginePower: 2565.0, slip: 14.56, course: 278, amount: 0,
    windO: 'VAR0', wavesO: 'VAR0.0', windF: 0, waveF: 0, currF: 0, avgF: '0 / 0 / 0',
  },
  {
    rt: 'N', date: '28Jun2026', time: '0300', hrs: 24.0, lat: '0713N', lng: '14355E',
    vlsfoRob: 435.66, vlsfoBunkered: 0, vlsfoCorrected: 0,
    lsmgoRob: 77, lsmgoBunkered: 0, lsmgoCorrected: 0,
    noneRob: 0, noneBunkered: 0, noneCorrected: 0,
    distR: 236.0, distO: 577.3, dtgO: 1267.9, avgSpeedO: 24.1,
    rpm: 83.02, enginePower: 2566.0, slip: 12.29, course: 278, amount: 0,
    windO: 'VAR0', wavesO: 'VAR0.0', windF: 0, waveF: 0, currF: 0, avgF: '0 / 0 / 0',
  },
];

function n(value: number | null, digits = 2): string {
  if (value === null) return '';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function TracksheetGrid() {
  const selectedVoyage = useSelectedVoyage();
  const vesselName = selectedVoyage?.vessel ?? 'MV Atlantic Voyager';
  const routeLabel = selectedVoyage
    ? `${selectedVoyage.portFrom} → ${selectedVoyage.portTo}`
    : 'Singapore → Rotterdam';
  return (
    <div className="fv-tracksheet">
      <div className="fv-tracksheet__header">
        <span className="fv-tracksheet__vessel">{vesselName}</span>
        <span className="fv-tracksheet__route">{routeLabel}</span>
      </div>
      <table className="fv-tracksheet__table">
        <thead>
          <tr className="fv-tracksheet__group-row">
            <th colSpan={6}>Fundamentals</th>
            <th colSpan={3}>VLSFO 0.5% Sulphur</th>
            <th colSpan={3}>LSMGO 0.1% Sulphur</th>
            <th colSpan={3}>None</th>
            <th colSpan={3}>Distances</th>
            <th colSpan={1}>Speed</th>
            <th colSpan={4}>Engine</th>
            <th colSpan={1}>Cargo</th>
            <th colSpan={2}>Weather Conditions</th>
            <th colSpan={4}>Weather Factors</th>
            <th colSpan={3}>Rpt Sent</th>
            <th colSpan={1} />
          </tr>
          <tr className="fv-tracksheet__head-row">
            <th>RT</th>
            <th>Date</th>
            <th>Time</th>
            <th>HRS</th>
            <th>Lat</th>
            <th>Lng</th>

            <th>ROB</th>
            <th>Bunkered</th>
            <th>Corrected</th>

            <th>ROB</th>
            <th>Bunkered</th>
            <th>Corrected</th>

            <th>ROB</th>
            <th>Bunkered</th>
            <th>Corrected</th>

            <th>DistR</th>
            <th>DistO</th>
            <th>dtg-o</th>

            <th>AvSpd-O</th>

            <th>RPM</th>
            <th>EnginePower</th>
            <th>Slip</th>
            <th>Course</th>

            <th>Amount</th>

            <th>WindO</th>
            <th>WavesO</th>

            <th>Wind</th>
            <th>Wave</th>
            <th>Curr</th>
            <th>AvgF</th>

            <th>W</th>
            <th>F</th>
            <th>I</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {STUB_ROWS.map((r) => (
            <tr key={`${r.date}-${r.time}`}>
              <td>{r.rt}</td>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td className="fv-tracksheet__num">{n(r.hrs, 1)}</td>
              <td>{r.lat}</td>
              <td>{r.lng}</td>

              <td className="fv-tracksheet__num">{n(r.vlsfoRob, 2)}</td>
              <td className="fv-tracksheet__num">{n(r.vlsfoBunkered, 0)}</td>
              <td className="fv-tracksheet__num">{n(r.vlsfoCorrected, 0)}</td>

              <td className="fv-tracksheet__num">{n(r.lsmgoRob, 1)}</td>
              <td className="fv-tracksheet__num">{n(r.lsmgoBunkered, 0)}</td>
              <td className="fv-tracksheet__num">{n(r.lsmgoCorrected, 0)}</td>

              <td className="fv-tracksheet__num">{n(r.noneRob, 0)}</td>
              <td className="fv-tracksheet__num">{n(r.noneBunkered, 0)}</td>
              <td className="fv-tracksheet__num">{n(r.noneCorrected, 0)}</td>

              <td className="fv-tracksheet__num">{n(r.distR, 2)}</td>
              <td className="fv-tracksheet__num">{n(r.distO, 1)}</td>
              <td className="fv-tracksheet__num">{n(r.dtgO, 1)}</td>

              <td className="fv-tracksheet__num">{n(r.avgSpeedO, 1)}</td>

              <td className="fv-tracksheet__num">{n(r.rpm, 2)}</td>
              <td className="fv-tracksheet__num">{n(r.enginePower, 1)}</td>
              <td className="fv-tracksheet__num">{n(r.slip, 2)}</td>
              <td className="fv-tracksheet__num">{r.course ?? ''}</td>

              <td className="fv-tracksheet__num">{n(r.amount, 3)}</td>

              <td>{r.windO}</td>
              <td>{r.wavesO}</td>

              <td className="fv-tracksheet__num">{n(r.windF, 2)}</td>
              <td className="fv-tracksheet__num">{n(r.waveF, 2)}</td>
              <td
                className={`fv-tracksheet__num ${
                  r.currF < 0 ? 'fv-tracksheet__perf-loss' : ''
                }`}
              >
                {n(r.currF, 2)}
              </td>
              <td className="fv-tracksheet__num">{r.avgF}</td>

              <td className="fv-tracksheet__rpt" />
              <td className="fv-tracksheet__rpt" />
              <td className="fv-tracksheet__rpt" />
              <td className="fv-tracksheet__rpt"><i className="fas fa-save" aria-hidden="true" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
