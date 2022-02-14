import { resizeContainer, render } from '../../javascripts/lib/helpers'
import getDefaultTemplate from '../../templates/default'
import AirtableBase from '../lib/airtable_base'
import AirtableProject from '../lib/airtable_project'
import Productive from '../lib/productive'

const MAX_HEIGHT = 1000

class App {
  constructor (client) {
    this._client = client
    this._slugCustomFieldName = 'ticket.customField:custom_field_21915476'
    this.states = {}
    this._data = {}

    // this.initializePromise is only used in testing
    // indicate app initilization(including all async operations) is complete
    this.initializePromise = this.init()
  }

  /**
   * Initialize module, render main template
   */
  async init () {
    this._metadata = await this._client.metadata().catch(this._handleError.bind(this))
    if (!this._metadata) return this._handleError('An error occurred')
    this._ticket = await this._getZendeskField('ticket')

    const airtableProjectRecord = await this._initializeAirtableProject(this._metadata.settings).catch(this._handleError.bind(this))
    this._productiveClient = await this._initializeProductiveClient(this._metadata.settings.productive_api_key, this._metadata.settings.productive_org_id)
    if (!airtableProjectRecord) return this._handleError('Could not find project in Airtable')
    if (!airtableProjectRecord.productive_url) return this._handleError('Could not find Productive project URL in Airtable')
    if (!this._productiveClient) return this._handleError('Could not connect to Productive')

    const projectId = this._productiveClient.getProjectIdFromUrl(airtableProjectRecord.productive_url)
    if (!projectId) return this._handleError('Could not identify Productive project ID')

    const [person, project, deals] = await Promise.all([
      this._getPerson(),
      this._productiveClient.getProject(projectId),
      this._productiveClient.getActiveBudgets(projectId)
    ])
      .catch(this._handleError.bind(this))
      .then((result) => result || [])

    if (person && project && deals) {
      this._data.person = person
      this._data.project = project

      this._productiveClient.getTimeEntriesContaining(this._ticket.id)
        .then(ticketTimeEntries => {
          console.log('Retrieved time entries from Productive')
          this.states.ticket = {
            hours: this._convertToHours(ticketTimeEntries.reduce((total, entry) => total + entry.attributes.time, 0))
          }
          console.log('Rendering...')
          this._renderTemplate()
        })
        .catch(this._handleError.bind(this))

      return this._productiveClient.getProjectSupportService(projectId, deals.map(deal => deal.id))
        .then(service => {
          this._data.service = service
          this._data.budget = deals.find(budget => budget.id === service.relationships.deal.data.id)

          const productiveBaseUrl = 'https://app.productive.io/15642-dxw/'

          this.states.person = { email: this._data.person.attributes.email }
          this.states.service = {
            name: this._data.service.attributes.name,
            hours: this._convertToHours(this._data.service.attributes.worked_time)
          }
          this.states.budget = {
            name: this._data.budget.attributes.name,
            url: productiveBaseUrl + 'projects/budgets/d/deal/' + this._data.budget.id + '/time-entries',
            start_date: this._data.budget.attributes.date
          }
          this.states.project = {
            name: this._data.project.attributes.name,
            url: productiveBaseUrl + 'projects/' + this._data.project.id + '/time-entries'
          }

          this.states.okay = true
          this._renderTemplate()
          document.getElementById('note').value = this._ticket.subject
          document.getElementById('submit').addEventListener('click', e => { e.preventDefault(); this._logTime() })
        })
        .catch(this._handleError.bind(this))
    }
  }

  async _logTime () {
    const duration = this._calculateDuration(document.getElementById('duration').value)
    const note = document.getElementById('note').value + ` (<a href="https://dxw.zendesk.com/agent/tickets/${this._ticket.id}">#${this._ticket.id}</a>)`
    return this._productiveClient.createTimeEntry(duration, this._data.service.id, this._data.person.id, note)
      .then(this._handleSuccess('Time logged successfully'))
      .catch(this._handleError.bind(this))
  }

  _convertToHours (minutes, dp = 1) {
    return Math.round(minutes / 60 * (10 ** dp)) / (10 ** dp)
  }

  _calculateDuration (durationString) {
    if (durationString.includes(':')) {
      const parts = durationString.split(':')
      return parseInt(parts[0]) * 60 + parseInt(parts[1])
    } else {
      return parseInt(durationString)
    }
  }

  async _getZendeskField (identifier) {
    const data = await this._client.get(identifier)
    return data[identifier]
  }

  async _initializeAirtableProject (settings) {
    const projectSlug = await this._getZendeskField(this._slugCustomFieldName)
    const base = this._airtableBase(settings.airtable_api_key, settings.airtable_base_id)

    if (base) {
      return await AirtableProject.init(
        base,
        projectSlug
      )
    } else {
      return null
    }
  }

  _airtableBase (apiKey, baseID) {
    const base = new AirtableBase(apiKey, baseID)
    if (base) {
      return base
    } else {
      this._handleError('Could not connect to Airtable')
      return null
    }
  }

  async _initializeProductiveClient (apiKey, orgId) {
    const client = new Productive(apiKey, orgId)
    return await client.init()
      .then(() => client)
      .catch(() => null)
  }

  async _getPerson () {
    return this._client.get('currentUser')
      .then(zendeskData => this._productiveClient.getPersonByEmail(zendeskData.currentUser.email))
  }

  _handleError (error) {
    console.error(error)
    this._showNotice({
      type: 'error',
      message: error || 'An error occurred'
    })
  }

  _handleSuccess (success) {
    console.log(success)
    this._showNotice({
      type: 'success',
      message: success || 'Success'
    })
  }

  _showNotice (message) {
    this.states.message = message
    this._renderTemplate()
  }

  _renderTemplate () {
    render('#main', getDefaultTemplate(this.states))
    resizeContainer(this._client, MAX_HEIGHT)
  }
}

export default App
