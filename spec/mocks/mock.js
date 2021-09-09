const stubJSON = function (filename) {
  return new Promise((resolve) => {
    const json = require('../fixtures/' + filename + '.json')
    resolve(json)
  })
}

export const CLIENT = {
  _origin: 'zendesk.com',
  get: (prop) => {
    if (prop === 'ticket.customField:custom_field_21915476') {
      return Promise.resolve({
        'ticket.customField:custom_field_21915476': 'my-project'
      })
    }
    if (prop === 'currentUser') {
      return Promise.resolve({
        currentUser: { email: 'hello@example.com' }
      })
    }
    if (prop === 'ticket') {
      return Promise.resolve({
        ticket: { id: 1234 }
      })
    }
    return Promise.resolve({
      [prop]: null
    })
  },
  metadata: () => {
    return Promise.resolve({
      settings: {
        airtable_api_key: '123',
        airtable_base_id: 'abc',
        productive_api_key: 'key',
        productive_org_id: '1234'
      }
    })
  },
  invoke: () => {}
}

export const airtableBase = function (setting) {
  const client = {
    async findProjectBySlug (slug) {
      const result = await stubJSON('airtable-project-' + slug)
      return result[0]
    }
  }

  switch (setting) {
    case 'no project':
      client.findProjectBySlug = () => null
      break
    case 'no link':
      client.findProjectBySlug = async (slug) => {
        const result = await stubJSON('airtable-project-' + slug)
        result[0].fields['Productive project link'] = null
        return result[0]
      }
      break
  }

  return client
}

export const productiveClient = function (setting) {
  const client = {
    async init () {
      return true
    },
    async getProject (projectId) {
      return stubJSON('productive-project')
    },
    async getPersonByEmail (email) {
      return stubJSON('productive-person')
    },
    async getActiveBudgets (projectId) {
      return stubJSON('productive-budgets')
    },
    async getProjectSupportService (projectId, dealIds) {
      return stubJSON('productive-service')
    },
    async getTimeEntriesContaining (text) {
      return stubJSON('productive-time-entries')
    },
    async createTimeEntry (duration, serviceId, personId) {
      return true
    },
    getProjectIdFromUrl (url) {
      return 1234
    }
  }

  switch (setting) {
    case 'no project':
      client.getProject = async (projectId) => { throw new Error(`Project with ID '${projectId}' not found on Productive`) }
      break
    case 'no person':
      client.getPersonByEmail = async (email) => { throw new Error(`Person with email '${email}' not found on Productive`) }
      break
    case 'no support service':
      client.getProjectSupportService = async (projectId, dealIds) => { throw new Error(`No support service for project with ID '${projectId}' found on Productive`) }
      break
    case 'time logging fails':
      client.createTimeEntry = async () => { throw new Error('Could not create time entry on Productive') }
      break
  }
  return client
}
