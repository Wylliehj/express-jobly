"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const Job = require("../models/jobs")
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilterSchema.json")


const router = new express.Router();

router.post('/', async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body)
        return res.status(201).json({job})
    }catch(e){
        return next(e)
    }
})

router.get('/', async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobFilterSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }
        const jobs = await Job.find(req.body)
        return res.json({jobs})
    }catch(e){
        return next(e)
    }
});

router.get('/:id', async (req, res, next) => {
    try{
        const job = await Job.get(req.params.id);
        return res.json({job})
    }catch(e){
        return next(e);
    }
})

router.patch('/:id', async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body)
        return res.json({job})
    }catch(e){
        return next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try{
        await Job.remove(req.params.id);
        return res.json({deleted: `job id ${req.params.id}`})
    }catch(e){
        return next(e);
    }
})

module.exports = router;