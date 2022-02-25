import exifr from 'exifr';
import PanoDao from '../dao/panorama.mjs';
import sharp from 'sharp';
import { promises as fs } from 'fs';

export default class PanoController {

    constructor(db) {
        this.dao = new PanoDao(db);
    }

    async findById(req, res) {
        try {
            const row = await this.dao.findById(req.params.id);
            if(row === null) {
                res.status(404).json({error:"Cannot find panorama with that ID"});
            } else {
                res.json(row);
            }
        } catch(e) {
            res.status(500).json({error: e});
        }
    }

    async getImage(req, res) {
        res.sendFile(`${process.env.PANO_DIR}/${req.params.id}.jpg`, { }, err => {
            if(err) {
                if(err.code == 'ENOENT') {
                    res.status(404).json({'error': 'Cannot find that panorama'});
                } else {
                    res.status(500).json({'error': err});
                }
            }
        });
    }


    async getImageResized(req, res) {
        try {
            const result = await sharp(`${process.env.PANO_DIR}/${req.params.id}.jpg`)
                .resize(parseInt(req.params.width))
                .toBuffer();
            res.set('Content-Type', 'image/jpg').send(result);
        } catch(e) {
            res.status(500).json({error: e});
        }
    }

    async deletePano(req, res) {
        try {
            const rowCount = await this.dao.deletePano(req.params.id);
            if(rowCount == 1) {
                await fs.unlink(`${process.env.PANO_DIR}/${req.params.id}.jpg`);
            }
            res.status(rowCount > 0 ? 200 : 404).json({nDeleted: rowCount});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }


    async findNearest(req, res) {
        try {    
            const regex = /^[\d\.\-]+$/;
            if(regex.exec(req.params.lon) && regex.exec(req.params.lat)) {
                const row = await this.dao.findNearest(req.params.lon, req.params.lat);
                if(row === null) {
                    res.status(404).json({error: 'No nearest pano found'});
                } else {
                    res.json(row);
                }
            } else {
                res.status(400).json({error: "Valid lat/lon not provided"});
            }
        } catch(e) {
            res.status(500).json({error: e});
        }
    }

    async findByBbox(req, res) {
        try {
            const bbox = req.query.bbox.split(',').filter( (value,i) => /^[\d\-\.]+$/.exec(value) && (value>=-90 && value<=90 || (i%2==0 && value>=-180 && value<=180))).map (value => parseFloat(value));
            if(bbox.length == 4 && bbox[0] < bbox[2] && bbox[1] < bbox[3])  {
                const rows = await this.dao.findByBbox(bbox);
                res.json({
                    features: rows.map ( row => {
                        const props = { };
                        Object.keys(row).forEach(k => {
                            if(['lon', 'lat'].indexOf(k) == -1) {
                                props[k] = row[k];
                            }
                        });
                        return {
                            geometry: {
                                type: "Point",
                                coordinates: [ row.lon, row.lat ]
                            },
                            properties: props,
                            type: "Feature"
                        } 
                    }),
                    type: 'FeatureCollection'
                });
            } else {
                res.status(400).json({error: 'Valid bounding box not provided'});
            }
        } catch(e) {
            res.status(500).json({error: e});
        }    
    }

    async rotate(req, res) {
        try {
            const rowCount = await this.dao.rotate(req.params.id, req.body.pan, req.body.tilt, req.body.roll);
            res.status(rowCount > 0 ? 200 : 404).json({'rotated': rowCount});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }

    async move(req, res) {
        try {
            const updatedRows = await this.dao.move(req.params.id, req.body.lon, req.body.lat);
            res.status(updatedRows > 0 ? 200 : 404).json({'moved': updatedRows });
        } catch(e) {
            res.status(500).json({error: e});
        }
    }

    async moveMulti(req, res) {
        try {
            let nMoved = await this.dao.moveMulti(req.body);    
            res.status(200).json({'moved': nMoved});
        } catch(e) {
            res.status(500).json({error: e});
        }
    }

    async upload(req, res) {
        const warnings = [ ];
        if(req.files.file) {
            try {
                const data = await exifr.parse(req.files.file.tempFilePath, {
                    xmp: true
                });
                let geom;
                if(data.latitude === undefined || data.longitude === undefined) {
                    warnings.push("No latitude and longitude in panorama; you'll have to later position manually");
                    geom = null;
                } else {
                    geom = `POINT(${data.longitude} ${data.latitude})`;
                }
                if(data.PoseHeadingDegrees === undefined) {
                    warnings.push("No orientation information; you'll have to later rotate manually");
                    data.PoseHeadingDegrees = 0;
                }
                const id = await this.dao.addPano(geom, data.PoseHeadingDegrees);
                if(id > 0) {
                    const returnData = {
                        id: id
                    };
                    if(warnings.length > 0) {
                        returnData.warning = warnings;
                    }
                    req.files.file.mv(`${process.env.RAW_UPLOADS}/${returnData.id}.jpg`);
                    res.json(returnData);
                } else {
                    res.status(500).json({error: 'Panorama not added to database'});
                }
            } catch(e) {
                res.status(500).json({error: e.toString()});
            }
        } else {
            res.status(400).json({error: 'File not uploaded'});
        }
    }

    async findNearby(req, res) {
        try {
            const rows = await this.dao.findNearby(req.params.lon, req.params.lat, req.params.limit);
            res.json(rows);
        } catch (e) {
            res.status(500).json({error: e});    
        }
    }

    async findUnauthorised(req, res) {
        try {
            const rows = await this.dao.findUnauthorised();
            res.json(rows);
        } catch (e) {
            res.status(500).json({error: e});    
        }
    }

    async findUnpositioned(req, res) {
        try {
            const rows = await this.dao.findUnpositioned();
            res.json(rows);
        } catch (e) {
            res.status(500).json({error: e});    
        }
    }

    async createSequence(req, res) {
        try {
            const panos = (await Promise.all( req.body.map ( id =>  { return this.dao.findById(id) } )
            )).filter(pano => pano != null);
            
            if(panos.length > 0) {
                const seqid = await this.dao.createSequence(panos);
                res.status(seqid>0 ? 200: 400).send({seqid: seqid});
            } else {
                res.status(404).json({error: "No pano IDs could be found."});
            }
        } catch(e) {
            res.status(500).json({error: e});    
        }
    }

    async getSequence(req, res) {
        try {
            const seq = await this.dao.getSequence(req.params.id);
            if(seq === null) {
                res.status(404).json({error: "No sequence with that ID could be found."});
            } else {
                res.json(seq);
            }
        } catch(e) {
            res.status(500).json({error: e});    
        }
    }
}

