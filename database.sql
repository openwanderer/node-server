DROP TABLE IF EXISTS panoramas;
DROP TABLE IF EXISTS sequence_geom; 
DROP TABLE IF EXISTS sequence_panos; 

CREATE TABLE panoramas(id serial, the_geom geometry, ele FLOAT, pancorrection FLOAT DEFAULT 0, tiltcorrection FLOAT DEFAULT 0, rollcorrection FLOAT DEFAULT 0, poseheadingdegrees FLOAT DEFAULT 0, authorised INT DEFAULT 0, userid INT DEFAULT 0, timestamp INT);
CREATE TABLE sequence_geom(id serial, the_geom geometry);
CREATE TABLE sequence_panos(id serial, sequenceid INT, panoid INT);
