# v6 measured browser performance

Artifact SHA-256: `23b3cab9d06e7b2268bfca336f5df1ba2a9cd346aac5d5ee6fbc0baa24dc830b`. Windows 10, headless Chromium 151.0.7922.34 / Firefox 153.0; Chromium uses SwiftShader. These are measurements on this machine, not physical-device or GPU certification.

## Scientific workspace and local pack

| Browser | Embedded startup, ms | 10k state queries, ms | 1k Lambert calls, ms | 4000 simulation steps, ms | 625-cell grid, ms | 50k-source cone load, ms |
|---|---:|---:|---:|---:|---:|---:|
| chromium | 1043.0 | 17.0 | 24.5 | 49.2 | 207.1 | 1482.9 |
| firefox | 1265.9 | 11.0 | 13.0 | 32.0 | 111.6 | 887.0 |
| mobile | 850.5 | 56.7 | 42.5 | 60.0 | 200.3 | 822.5 |

The pack is a genuine 50,000-row Gaia selection, 768 HEALPix RING order-3 tiles. The RA=100°, Dec=0°, radius=15° query retains 2,283 rows / 4,172,265 source bytes and publishes 1,334 cone-matching external/unverified rows. Runtime budgets: 32 MiB retained source, 20k rows, 4 MiB / 5k rows per tile. These budgets do not measure total process/GPU memory. The three-body 1000-day / 4000-step run has energy relative drift about 1.68e-7; that is not a JPL trajectory comparison.

## Existing whole-catalog import path

1440×1000 DPR1, fixed initial camera, reduced motion, S/N≥20 filter, 1 s settle and 4 s frame sample. Import timer probes request 20 ms intervals. Source JSON uses workers and transferable rendering buffers, but upload/commit/derived records still have substantial main-thread work.

| Browser | Rows | Startup, ms | Import wall, ms | Filter, ms | First pick, ms | Frame p95, ms | Max import timer gap, ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| chromium | 5,000 | 2390.9 | 173.9 | 13.6 | 2.8 | 49.9 | 33.6 |
| chromium | 20,000 | 845.0 | 1531.8 | 40.5 | 10.9 | 50.1 | 1070.0 |
| chromium | 50,000 | 897.5 | 2305.2 | 79.9 | 16.0 | 83.3 | 1143.6 |
| firefox | 5,000 | 962.8 | 406.0 | 10.0 | 2.0 | 7.0 | 44.0 |
| firefox | 20,000 | 731.2 | 909.0 | 15.0 | 4.0 | 7.0 | 64.0 |
| firefox | 50,000 | 698.6 | 2182.0 | 29.0 | 9.0 | 7.0 | 75.0 |

The timer-gap evidence includes publication/serialization pauses; asynchronous parsing alone does not make the whole-catalog import fully responsive. Local cone loading reduces the number of retained/published records but does not eliminate this existing commit cost. Optimization of that remaining main-thread work is future performance work.

Reproduce with `python tests/v6_browser_qa.py` and `python tests/benchmark_readiness.py --label v6-engine-final --output qa/v6/catalog-performance.json`. The benchmark harness uses the local Windows Playwright cache; hosted CI runs the cross-platform scientific/browser suites and 50k local-pack workload, with timing in uploaded `qa/v6/browser.json`. Raw local metrics are versioned in `qa/v6/browser.json` and `qa/v6/catalog-performance.json`.
