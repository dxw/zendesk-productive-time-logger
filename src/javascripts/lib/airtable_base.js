const Airtable = require('airtable')

class AirtableBase {
  constructor (apiKey, baseID) {
    this._base = new Airtable({ apiKey: apiKey }).base(baseID)
  }

  async findProjectBySlug (slug) {
    const result = await this._base('Projects').select({
      filterByFormula: '({Zendesk Slug}="' + slug + '")'
    }).all()

    return result[0]
  }
}

export default AirtableBase
