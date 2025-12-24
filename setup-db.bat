@echo off
echo Setting up MAHA FIGHT Database...

echo Creating database schema...
psql -h localhost -U postgres -d MahaFightDB -f database/schema.sql

echo Inserting sample data...
psql -h localhost -U postgres -d MahaFightDB -f database/sample-data.sql

echo Database setup completed!
echo You can now run the application.