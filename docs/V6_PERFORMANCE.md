# v6 measured browser performance

Artifact SHA-256: `970662e47c61da8624983ace2669d6a56879d052a5e72caf2e3fc672a50b0ceb`. Windows 10, headless Chromium 151.0.7922.34 / Firefox 153.0; Chromium uses SwiftShader. These are measurements on this machine, not physical-device or GPU certification.

## Scientific workspace and local pack

| Browser | Embedded startup, ms | 10k state queries, ms | 1k Lambert calls, ms | 4000 simulation steps, ms | 625-cell grid, ms | 50k-source cone load, ms |
|---|---:|---:|---:|---:|---:|---:|
| chromium | 3342.2 | 14.7 | 21.7 | 68.7 | 306.5 | 2453.7 |
| firefox | 1490.6 | 18.0 | 19.0 | 57.0 | 198.6 | 1828.9 |
| mobile | 1593.3 | 37.7 | 20.2 | 70.5 | 252.7 | 1590.0 |

The pack is a genuine 50,000-row Gaia selection, 768 HEALPix RING order-3 tiles. The RA=100°, Dec=0°, radius=15° query retains 2,283 rows / 4,172,265 source bytes and publishes 1,334 cone-matching external/unverified rows. Runtime budgets: 32 MiB retained source, 20k rows, 4 MiB / 5k rows per tile. These budgets do not measure total process/GPU memory. The three-body 1000-day / 4000-step run has energy relative drift about 1.68e-7; that is not a JPL trajectory comparison.

## Existing whole-catalog import path

1440×1000 DPR1, fixed initial camera, reduced motion, S/N≥20 filter, 1 s settle and 4 s frame sample. Import timer probes request 20 ms intervals. Source JSON uses workers and transferable rendering buffers, but upload/commit/derived records still have substantial main-thread work.

| Browser | Rows | Startup, ms | Import wall, ms | Filter, ms | First pick, ms | Frame p95, ms | Max import timer gap, ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| chromium | 5,000 | 3364.4 | 542.7 | 20.1 | 4.4 | 50.0 | 31.0 |
| chromium | 20,000 | 2180.8 | 2209.7 | 45.5 | 10.8 | 66.7 | 73.2 |
| chromium | 50,000 | 2127.5 | 4328.5 | 102.7 | 19.7 | 83.3 | 75.0 |
| firefox | 5,000 | 6917.2 | 547.0 | 17.0 | 7.0 | 13.9 | 51.0 |
| firefox | 20,000 | 1607.2 | 2307.0 | 33.0 | 8.0 | 13.9 | 200.0 |
| firefox | 50,000 | 1336.6 | 4804.0 | 73.0 | 21.0 | 13.9 | 188.0 |

The timer-gap evidence includes publication/serialization pauses; asynchronous parsing alone does not make the whole-catalog import fully responsive. Local cone loading reduces the number of retained/published records but does not eliminate this existing commit cost. Optimization of that remaining main-thread work is future performance work.

Reproduce with `python tests/v6_browser_qa.py` and `python tests/benchmark_readiness.py --label v6-engine-final --output qa/v6/catalog-performance.json`. The benchmark harness uses the local Windows Playwright cache; hosted CI runs the cross-platform scientific/browser suites and 50k local-pack workload, with timing in uploaded `qa/v6/browser.json`. Raw local metrics are versioned in `qa/v6/browser.json` and `qa/v6/catalog-performance.json`.
