-- LaunchTrace Database Seed Script
-- This script seeds the database with sample data

-- Clear existing data (in order to respect foreign key constraints)
DELETE FROM "BuildParts";
DELETE FROM "Builds";
DELETE FROM "Parts";
DELETE FROM "Suppliers";

-- Reset sequences
ALTER SEQUENCE "Suppliers_SupplierId_seq" RESTART WITH 1;
ALTER SEQUENCE "Parts_PartId_seq" RESTART WITH 1;
ALTER SEQUENCE "Builds_BuildId_seq" RESTART WITH 1;

-- Insert 30 suppliers
INSERT INTO "Suppliers" ("Name") VALUES
('SpaceX Manufacturing'),
('Boeing Aerospace'),
('Lockheed Martin'),
('Northrop Grumman'),
('Aerojet Rocketdyne'),
('Blue Origin'),
('Virgin Galactic'),
('Rocket Lab'),
('Relativity Space'),
('Firefly Aerospace'),
('Orbital Sciences'),
('Sierra Nevada Corp'),
('Masten Space Systems'),
('Vector Launch'),
('Stratolaunch'),
('Virgin Orbit'),
('Planetary Resources'),
('Moon Express'),
('Astrobotic Technology'),
('Intuitive Machines'),
('ispace'),
('Orbit Fab'),
('Made In Space'),
('Varda Space Industries'),
('Axiom Space'),
('Gateway Foundation'),
('Space Tango'),
('NanoRacks'),
('Redwire Space'),
('Maxar Technologies');

-- Generate 1500 parts (90% OK, 10% FAULTY)
-- First insert 1350 OK parts
DO $$
DECLARE
    i INTEGER;
    supplier_count INTEGER;
    part_names TEXT[] := ARRAY[
        'Thruster Nozzle', 'Fuel Tank', 'Oxidizer Valve', 'Engine Controller', 'Turbopump',
        'Heat Shield', 'Guidance System', 'Telemetry Unit', 'Battery Pack', 'Solar Panel',
        'Attitude Control', 'Reaction Wheel', 'Star Tracker', 'Gyroscope', 'Accelerometer',
        'Pressure Sensor', 'Temperature Sensor', 'Flow Meter', 'Circuit Board', 'Wire Harness',
        'Connector', 'Relay', 'Fuse', 'Capacitor', 'Resistor', 'Antenna', 'Transmitter',
        'Receiver', 'Amplifier', 'Filter', 'Thruster Gimbal', 'Payload Bay Door',
        'Landing Gear', 'Parachute System', 'Recovery Beacon', 'Flight Computer',
        'Memory Module', 'Processor Unit', 'Power Supply', 'Cooling System'
    ];
BEGIN
    SELECT COUNT(*) INTO supplier_count FROM "Suppliers";
    
    -- Insert 1350 OK parts
    FOR i IN 1..1350 LOOP
        INSERT INTO "Parts" ("Name", "Status", "SupplierId") VALUES
        (
            part_names[((i - 1) % array_length(part_names, 1)) + 1] || ' #' || i,
            0, -- OK status
            ((i - 1) % supplier_count) + 1
        );
    END LOOP;
    
    -- Insert 150 FAULTY parts
    FOR i IN 1351..1500 LOOP
        INSERT INTO "Parts" ("Name", "Status", "SupplierId") VALUES
        (
            part_names[((i - 1) % array_length(part_names, 1)) + 1] || ' #' || i,
            1, -- FAULTY status
            ((i - 1) % supplier_count) + 1
        );
    END LOOP;
END $$;

-- Generate 200 builds with random dates in the last 365 days
DO $$
DECLARE
    i INTEGER;
    random_date DATE;
    parts_count INTEGER;
    random_parts_in_build INTEGER;
    j INTEGER;
    random_part_id INTEGER;
    random_quantity INTEGER;
BEGIN
    SELECT COUNT(*) INTO parts_count FROM "Parts";
    
    FOR i IN 1..200 LOOP
        -- Generate random date in last 365 days
        random_date := CURRENT_DATE - (RANDOM() * 365)::INTEGER;
        
        INSERT INTO "Builds" ("SerialNumber", "BuildDate") VALUES
        (
            'SN-' || LPAD(i::TEXT, 4, '0'),
            random_date
        );
        
        -- Add 2-10 random parts to each build
        random_parts_in_build := (RANDOM() * 8 + 2)::INTEGER; -- 2 to 10 parts
        
        FOR j IN 1..random_parts_in_build LOOP
            random_part_id := (RANDOM() * (parts_count - 1) + 1)::INTEGER;
            random_quantity := (RANDOM() * 3 + 1)::INTEGER; -- 1 to 4 quantity
            
            -- Insert only if this part is not already in this build
            INSERT INTO "BuildParts" ("BuildId", "PartId")
            SELECT i, random_part_id
            WHERE NOT EXISTS (
                SELECT 1 FROM "BuildParts" 
                WHERE "BuildId" = i AND "PartId" = random_part_id
            );
        END LOOP;
    END LOOP;
END $$;
