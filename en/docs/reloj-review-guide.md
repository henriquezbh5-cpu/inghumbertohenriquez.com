# RELOJ: technical review guide

Own demonstration by Humberto Henríquez. Updated: 15 October 2026.

## What can be evaluated

RELOJ represents a close using four sources with different ages. It runs in the browser with synthetic data and a fixed seed. It lets a reviewer compare freshness and validation policies before publishing a result.

- Case and limitations: https://inghumbertohenriquez.com/en/proyectos/consolidacion-datos/
- Demonstration: https://inghumbertohenriquez.com/en/laboratorio/#reloj
- Scenario code: https://inghumbertohenriquez.com/en/laboratorio/sys/reloj.js
- Shared utilities: https://inghumbertohenriquez.com/laboratorio/lab-core.js

The linked code is served by the website. It is not a complete enterprise integration repository. No API keys or client data are needed to try the demonstration.

## Reproducible walkthrough

1. Open RELOJ and run its initial configuration. Review the age of each source, the source table and the final result.
2. Reduce the freshness threshold and select the policy that rejects stale sources. When a source exceeds the threshold, the scenario stops there without publishing.
3. Select acceptance with a warning, simulate a service outage and keep the option that stops on validation failure. The deferred source remains visible and the scenario stops at validation.
4. Disable that stop and repeat. Publication continues with warnings; review the freshness information carried with the result.
5. Compare with silent acceptance. This option represents the risk of hiding staleness; it is not an operational recommendation.

## Design decisions to discuss

- **Freshness per source:** a total alone cannot describe how current its inputs are.
- **Separate state and policy:** source state and permission to publish are different decisions.
- **Explicit warnings:** text should support assessment of deferred data without relying only on colour.
- **Reproducible synthetic baseline:** the seed makes a scenario repeatable without exposing third-party information.

The representation groups 42 checks into families; it does not run 42 external queries. Times and quantities are scenario values, not a performance measurement or observed savings.

## What a real implementation would require

Data contracts, real connectors, protected authentication and secrets, run persistence, idempotency, access controls, recovery tests and observability. Data handling and publication rules would be agreed with the responsible team. This demonstration does not establish that those components operate in production.

## Contact

Profile and terms: https://inghumbertohenriquez.com/en/colaboracion/

Services through Optimatiza; employment opportunities discussed directly with Humberto. No immediate capacity or fixed delivery period is advertised.
