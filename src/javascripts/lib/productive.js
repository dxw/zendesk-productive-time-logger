import { fetch } from 'whatwg-fetch'

class Productive {
  constructor (apiKey, orgId) {
    this._apiKey = apiKey
    this._orgId = orgId
    this._rootUrl = 'https://api.productive.io/api/v2/'
    this._supportServiceTypeId = '93265'
  }

  async init () {
    const result = await this._makeRequest('users')
    return Object.prototype.hasOwnProperty.call(result, 'data')
  }

  async _makeRequest (endpoint, method = 'GET', params = {}, body = null) {
    const urlParams = new URLSearchParams(params)

    return fetch(this._rootUrl + endpoint + '?' + urlParams.toString(), {
      method,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'X-Auth-Token': this._apiKey,
        'X-Organization-Id': this._orgId
      },
      body
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.status === 401) {
          throw responseData
        } else if (Object.prototype.hasOwnProperty.call(responseData, 'errors')) {
          throw responseData.errors[0]
        } else {
          return responseData
        }
      })
  }

  async getProject (projectId) {
    return await this._makeRequest('projects/' + projectId)
      .then(responseData => responseData.data)
      .catch(e => this._handleError(`Project with ID '${projectId}' not found on Productive`, e))
  }

  async getPersonByEmail (email) {
    return this._makeRequest('people', 'GET', {
      'filter[email]': email
    })
      .then(responseData => responseData.data[0])
      .catch(e => this._handleError(`Person with email '${email}' not found on Productive`, e))
  }

  async getActiveBudgets (projectId) {
    return this._makeRequest('deals', 'GET', {
      'filter[budget_status]': 1,
      'filter[project_id]': projectId
    })
      .then(responseData => responseData.data.filter(budget => (budget.attributes.end_date === null) || (budget.attributes.end_date > this._getIsoDateString())))
      .catch(e => this._handleError(`No budgets for project with ID '${projectId}' found on Productive`, e))
  }

  async getProjectSupportServices (projectId, dealIds) {
    return this._makeRequest('services', 'GET', {
      'filter[deal_id]': dealIds.join(','),
      'filter[project_id]': projectId
    })
      .then(responseData => {
        const supportServices = responseData.data.filter(service => service.relationships.service_type.data?.id === this._supportServiceTypeId)
        if (!supportServices) {
          throw new Error()
        }
        return supportServices
      })
      .catch(e => this._handleError(`No support services for project with ID '${projectId}' found on Productive`, e))
  }

  async getTimeEntriesContaining (text) {
    return this._makeRequest('time_entries', 'GET', {
      'filter[note][contains]': text
    })
      .then(responseData => responseData.data)
      .catch(e => this._handleError('An error occurred', e))
  }

  async createTimeEntry (duration, serviceId, personId, note = 'Support') {
    if (!duration) return false

    const body = {
      data: {
        type: 'time_entries',
        attributes: {
          note,
          date: this._getIsoDateString(),
          time: duration.toString()
        },
        relationships: {
          person: {
            data: {
              type: 'people',
              id: personId.toString()
            }
          },
          service: {
            data: {
              type: 'services',
              id: serviceId.toString()
            }
          }
        }
      }
    }
    return this._makeRequest('time_entries', 'POST', {}, JSON.stringify(body))
      .then(responseData => console.log(responseData))
      .catch(e => this._handleError('Could not create time entry on Productive', e))
  }

  getProjectIdFromUrl (url) {
    const match = url.match(/projects\/(\d+)/)
    return match ? match[1] : null
  }

  _getIsoDateString () {
    return new Date().toISOString().split('T')[0]
  }

  _handleError (errorMessage, productiveError) {
    console.error('Productive API: ' + productiveError.detail)
    throw errorMessage
  }
}

export default Productive
