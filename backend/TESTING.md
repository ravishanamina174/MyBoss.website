# Backend security tests

The integration suite uses a dedicated local PostgreSQL database. It never reads
the production `DB_URL`, `DB_USERNAME`, or `DB_PASSWORD` variables.

Create the database once:

```sh
createdb -h 127.0.0.1 -p 5432 myboss_security_test
```

Run the complete suite with test-only variables:

```sh
TEST_DB_URL=jdbc:postgresql://127.0.0.1:5432/myboss_security_test \
TEST_DB_USERNAME=your-local-postgres-user \
TEST_DB_PASSWORD=your-local-postgres-password \
./mvnw clean test
```

Flyway runs V1 through V4 against this database. If PostgreSQL is unavailable,
start a local PostgreSQL service and rerun the command; do not replace it with
H2 or point the tests at a production database.
