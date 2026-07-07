# Testing

## How to run

PYTHONPATH=. pytest services/api/tests

PYTHONPATH=. pytest services/api/tests --cov=services.api.auth --cov=services.api.users_service --cov=services.api.routes.auth_routes

## Current result

13 passed

79% total auth coverage
