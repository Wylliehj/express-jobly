"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: 'tester',
    salary: 99999,
    equity: '0',
    companyHandle: 'c1',
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
        id: job.id,
        title: 'tester',
        salary: 99999,
        equity: '0',
        companyHandle: 'c1',
    });

    const result = await db.query(
        `SELECT title,
        salary,
        equity,
        company_handle AS "companyHandle"
        FROM jobs
        WHERE company_handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        title: "tester",
        salary: 99999,
        equity: '0',
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let job = await Job.findAll();
    expect(job).toEqual([
        {
            id: expect.any(Number),
            title: 'j1',
            salary: 20000,
            equity:'0',
            companyHandle: 'c2'
        },
        {
            id: expect.any(Number),
            title: 'j2',
            salary: 30000,
            equity: '0',
            companyHandle: 'c3'
        }
    ]);
  });
});

/************************************** find */

describe('find', function () {
  test('works: filter by title', async () => {
    let jobs = await Job.find({title: 'j1'})
    expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: 'j1',
            salary: 20000,
            equity:'0',
            companyHandle: 'c2'
        },
    ])
  })
  test('works: filter by salary', async () => {
    let jobs = await Job.find({minSalary: 10000})
    expect(jobs).toEqual([
        {
            id: expect.any(Number),
            title: 'j1',
            salary: 20000,
            equity:'0',
            companyHandle: 'c2'
        },
        {
            id: expect.any(Number),
            title: 'j2',
            salary: 30000,
            equity: '0',
            companyHandle: 'c3'
        }
    ])
  })
})

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const newJob = {
        title: 'tester',
        salary: 99999,
        equity: '0',
        companyHandle: 'c1',
      };
    let jobId = await Job.create(newJob)
    let job = await Job.get(jobId.id);
    expect(job).toEqual({
        id: expect.any(Number),
        title: 'tester',
        salary: 99999,
        equity: '0',
        companyHandle: 'c1',
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(99999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    salary: 40000,
    equity: "0.5",
  };
  const newJob = {
    title: 'tester',
    salary: 99999,
    equity: '0',
    companyHandle: 'c1',
  };

  test("works", async function () {
    let jobId = await Job.create(newJob)
    let job = await Job.update(jobId.id, updateData);
    expect(job).toEqual({
      title: 'tester',
      companyHandle: 'c1',
      id: jobId.id,
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${jobId.id}`);
    expect(result.rows).toEqual([{
      id: jobId.id,
      title: 'tester',
      salary: 40000,
      equity: '0.5',
      companyHandle: 'c1'
    }]);
  });

  test("works: null fields", async function () {
    let jobId = await Job.create(newJob)
    const updateDataSetNulls = {
      salary: null,
      equity: null,
    };

    let job = await Job.update(jobId.id, updateDataSetNulls);
    expect(job).toEqual({
      id: jobId.id,
      companyHandle: 'c1',
      title: 'tester',
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = '${jobId.id}'`);
    expect(result.rows).toEqual([{
      id: jobId.id,
      title: 'tester',
      companyHandle: "c1",
      salary: null,
      equity: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Job.update(99999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      let jobId = await Job.create(newJob)
      await Job.update(jobId.id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
    const newJob = {
        title: 'tester',
        salary: 99999,
        equity: '0',
        companyHandle: 'c1',
      };
  test("works", async function () {
    let jobId = await Job.create(newJob)
    await Job.remove(jobId.id);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id = ${jobId.id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(999999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
