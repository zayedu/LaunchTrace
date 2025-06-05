-- Create the database schema for LaunchTrace

-- Create Suppliers table
CREATE TABLE "Suppliers" (
    "SupplierId" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL
);

-- Create Parts table
CREATE TABLE "Parts" (
    "PartId" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0, -- 0 = OK, 1 = FAULTY
    "SupplierId" INTEGER NOT NULL,
    FOREIGN KEY ("SupplierId") REFERENCES "Suppliers"("SupplierId")
);

-- Create Builds table
CREATE TABLE "Builds" (
    "BuildId" SERIAL PRIMARY KEY,
    "SerialNumber" VARCHAR(255) NOT NULL UNIQUE,
    "BuildDate" TIMESTAMP NOT NULL
);

-- Create BuildParts table (many-to-many relationship)
CREATE TABLE "BuildParts" (
    "BuildId" INTEGER NOT NULL,
    "PartId" INTEGER NOT NULL,
    PRIMARY KEY ("BuildId", "PartId"),
    FOREIGN KEY ("BuildId") REFERENCES "Builds"("BuildId"),
    FOREIGN KEY ("PartId") REFERENCES "Parts"("PartId")
);

-- Create indexes for better performance
CREATE INDEX "IX_Parts_SupplierId" ON "Parts"("SupplierId");
CREATE INDEX "IX_BuildParts_BuildId" ON "BuildParts"("BuildId");
CREATE INDEX "IX_BuildParts_PartId" ON "BuildParts"("PartId");
