class AirtableProject {
  static async init (airtableBase, slug) {
    const data = await airtableBase.findProjectBySlug(slug)
    if (data) {
      const project = new AirtableProject(airtableBase, data)
      await project.initializeFields()
      return project
    } else {
      return null
    }
  }

  constructor (airtableBase, data) {
    this._id = data.id
    this._fields = data.fields
    this._base = airtableBase
    this._tableID = 'tblne7bw5jfACz2XB'
    this._viewID = 'viwF0lQjetG2ICuO2'
  }

  async initializeFields () {
    this.airtable_url = this.airtableURL()
    this.productive_url = this._fields['Productive project link']
  }

  airtableURL () {
    return [
      'https://airtable.com',
      this._tableID,
      this._viewID,
      this._id
    ].join('/')
  }
}

export default AirtableProject
