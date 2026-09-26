# Literature and provenance audit — 2026-09-26

Consensus searches were followed by paper-record fetches before use. Scite metadata and forward citation graphs were inspected separately. Returned excerpts and citation labels are discovery evidence; bibliographic counts are not validity scores. The audit is targeted, not a systematic review. Raw connector responses are retained in `qa/v5/external-*.json` and `scite-distance-context.json`.

| Topic | Primary source | Finding and application |
|---|---|---|
| Cosmological defaults | [Planck 2018 VI](https://doi.org/10.1051/0004-6361/201833910) | Supports the adopted base-ΛCDM H0 and matter density. Model assumptions remain explicit; parameter inference is not a direct distance measurement. |
| Later Planck analysis | [Tristram et al., PR4](https://consensus.app/papers/cosmological-parameters-derived-from-the-final-planck-tristram-banday/fa415a2e0b765db996f4939570d4e28c/) | Fetched record reports consistency with the older baseline with refined uncertainties. v5 deliberately retains the documented model rather than calling it the newest fit. Connector abstract contains malformed equations, so those values were not copied. |
| Distance definitions | [Hogg, Distance measures in cosmology](https://arxiv.org/abs/astro-ph/9905116) | Keeps comoving, angular-diameter, luminosity and lookback measures distinct. |
| Gaia astrometry | [ESA DR3 overview](https://www.cosmos.esa.int/web/gaia/dr3) | DR3 uses reference epoch 2016.0; frame and epoch are distinct. |
| Parallax zero point | [Lindegren et al. 2021](https://doi.org/10.1051/0004-6361/202039653) | Bias depends on magnitude, color and position. The pipeline makes no blanket zero-point correction and does not claim unbiased distances. |
| Distance inference | [Bailer-Jones et al. 2021](https://doi.org/10.3847/1538-3881/abd806) | Probabilistic geometric/photogeometric inference is needed beyond precise-parallax approximations. v5 does not label inverse parallax as this Bayesian product. |
| RUWE qualification | [El-Badry 2025](https://consensus.app/papers/how-to-use-gaia-parallaxes-for-stars-with-poor-astrometric-el-badry/36a0b79d84635154b77f80454e273b92/) | High RUWE need not make all parallaxes unusable; uncertainties can be underestimated. The v5 cut is a conservative sample choice, not a universal reliability boundary. No uncertainty-inflation prescription is implemented. |
| Legacy bright-star fields | [HEASARC BSC5P](https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html) | Parallax is in arcseconds; normalized mas values retain flags in raw fields. Missing formal errors prevent distance inference. |
| Orion distance | [Menten et al. 2007](https://arxiv.org/abs/0709.0485) | Adopted 414±7 pc checked against the primary abstract; cluster depth and later revisions are not modeled. |
| Galactic-center distance | [GRAVITY 2019](https://arxiv.org/abs/1904.05721) | Adopted 8178 pc checked; statistical/systematic errors remain separate in provenance. |
| LMC distance | [Pietrzyński et al. 2019](https://arxiv.org/abs/1903.08096) | Adopted eclipsing-binary distance checked; it is an adopted galaxy distance, not every star's position. |
| Centaurus A | [Harris et al.](https://arxiv.org/abs/0911.3180) | Primary source identity checked; retained literature distance remains approximate. |
| Betelgeuse | [Joyce et al. 2020](https://arxiv.org/abs/2006.09837), [Montargès et al. observations](https://academic.oup.com/mnrasl/article/527/1/L88/7284409) | Seismic and radio distance estimates differ; v4's legacy inverse-parallax position is retained as an explicitly qualified display estimate and blocked from physical separation. |

## Scite findings and limits

The distance-paper metadata reported one contrasting citation, but the attempted targeted contrasting search returned no record. This does not establish either that the method is disputed or that it is undisputed. A forward graph returned concrete later contexts: asymmetric distance intervals require care; bright evolved stars can have uncertain distances; and Galactic priors can shift inferred distances when parallaxes are weak. See [a later reddening study](https://doi.org/10.3847/1538-3881/ae1f0f) and [a stellar-pulsation study](https://doi.org/10.1017/pasa.2025.10116). These are methodological qualifications, not grounds to discard Bayesian inference wholesale.

The multi-seed Planck graph hit its edge cap before covering all seeds. A separate distance-paper graph improved coverage but was also truncated. Some edges supplied no citation snippets. Consequently the release makes no exhaustive claim about all later support or dispute for Planck, RUWE, propagation, CMB physics or every landmark. Scite excerpts that appear inconsistent with a paper's date are not used as sole numerical authority.

## Numerical verification

Wolfram Language independently integrated the specified expansion function using NIntegrate and checked coordinate transforms, angular separation and parallax conversion. Values and tolerances are in `tests/fixtures/independent-numerics.json`. This verifies the implementation of the chosen model, not the scientific uniqueness of its assumptions. Runtime operation requires neither Wolfram nor any literature connector.
