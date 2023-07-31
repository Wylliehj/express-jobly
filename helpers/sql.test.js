const db = require('../db')
const {sqlForPartialUpdate} = require('./sql')

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url)
         VALUES(
            'tc',
            'test_company',
             27,
            'a company for testing',
            'someurl.com'
         )` 
    )
})

afterEach(async () => {
    let result = await db.query(
        `DELETE
         FROM companies
         WHERE handle = 'tc'`
    )
})

describe('Create SQL for update', function () {
    test('works: valid data', function () {
        const dataToUpdate = {
            numberEmployees: 240,
            logoUrl: 'differenturl.com'
        }
        const sql = sqlForPartialUpdate(dataToUpdate, {
            numEmployees: 'num_employees',
            logoURL: 'logo_url'
        });
        expect(sql.values).toEqual([240, 'differenturl.com'])
    })

    test('works: invalid data', function () {
        const dataToUpdate = {}
        expect(() => {sqlForPartialUpdate(dataToUpdate, {
            numEmployees: 'num_employees',
            logoURL: 'logo_url'
        })}).toThrow();
    })
})