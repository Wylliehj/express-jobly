const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/** Accepts 'data' and 'jsToSql' and maps to SQL readable format.
 * 
 * Accepts object "jsToSql" and maps keys to string SQL column selectors 'setCols'.
 * 
 *    {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
 * 
 * Accepts object 'dataToUpdate' and maps values to array 'values'.
 * 
 *    {firstName: 'Aliya', age: 32} => ['Aliya', 32]
 * 
 * Returns object with 'setCols' and 'values'
 * 
 *  {
 *    setCols: "'num_employees'=$1, 'logoUrl'=$2",
 *    values: [240, 'someurl.com']
 *  }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
