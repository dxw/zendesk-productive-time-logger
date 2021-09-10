import AirtableProject from '../src/javascripts/lib/airtable_project.js'
import { airtableBase } from './mocks/mock'

describe('project.js', () => {
  let project

  beforeEach(async () => {
    project = await AirtableProject.init(airtableBase(), 'my-project')
  })

  it('returns the Airtable URL', () => {
    expect(project.airtable_url).toEqual('https://airtable.com/tblne7bw5jfACz2XB/viwF0lQjetG2ICuO2/123')
  })

  it('returns project data', () => {
    expect(project.productive_url).toEqual('https://app.productive.io/org-id/projects/1234/tasks?filter=LTE%3D')
  })
})
