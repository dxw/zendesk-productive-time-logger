/**
 * @jest-environment jsdom
 */
import App from '../src/javascripts/modules/app'

import { CLIENT, productiveClient, airtableBase } from './mocks/mock'
import createRangePolyfill from './polyfills/createRange'

if (!document.createRange) {
  createRangePolyfill()
}

function initializeApp (airtable, productive) {
  jest.resetModules()
  document.body.innerHTML = '<section data-main id="main"><img class="loader" src="spinner.gif"/></section>'
  App.prototype._airtableBase = jest.fn(() => {
    return airtable
  })
  App.prototype._initializeProductiveClient = jest.fn(() => {
    return productive
  })
  const app = new App(CLIENT)

  return app.initializePromise
}

describe('Example App', () => {
  describe('Initialization Failure', () => {
    beforeEach((done) => {
      jest.spyOn(CLIENT, 'metadata').mockReturnValueOnce(Promise.reject(new Error('An error occurred')))
      initializeApp(airtableBase(), productiveClient()).then(_ => done())
    })

    afterEach(() => {
      CLIENT.metadata.mockRestore()
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch('An error occurred')
    })
  })

  describe('Initialization Success', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), productiveClient()).then(_ => done())
    })

    it('should display the project data', () => {
      const productiveTimeLogger = document.querySelector('#productive_time_logger')

      expect(productiveTimeLogger.querySelector('#project-name').textContent).toBe('My project')
      expect(productiveTimeLogger.querySelector('#budget-name').textContent).toBe('Support')
      expect(productiveTimeLogger.querySelector('#person-email').textContent).toBe('hello@example.com')
    })
  })

  describe('when Airtable API doesnt work', () => {
    beforeEach(done => {
      initializeApp(null, productiveClient()).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch('Could not find project in Airtable')
    })
  })

  describe('when project is not present in airtable', () => {
    beforeEach(done => {
      initializeApp(airtableBase('no project'), productiveClient()).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch('Could not find project in Airtable')
    })
  })

  describe('when link is not present in Airtable', () => {
    beforeEach(done => {
      initializeApp(airtableBase('no link'), productiveClient()).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch('Could not find Productive project URL in Airtable')
    })
  })

  describe('when productive API doesnt work', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), null).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch('Could not connect to Productive')
    })
  })

  describe('when person is not present in productive', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), productiveClient('no person')).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch("Person with email 'hello@example.com' not found on Productive")
    })
  })

  describe('when project is not present in productive', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), productiveClient('no project')).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch("Project with ID '1234' not found on Productive")
    })
  })

  describe('when project has no support services in productive', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), productiveClient('no support services')).then(_ => done())
    })

    it('should show an error message on the page', () => {
      expect(document.querySelector('#message').textContent).toMatch("No support services for project with ID '1234' found on Productive")
    })
  })
    })
  })

  describe('when time logging to productive fails', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), productiveClient('time logging fails')).then(_ => done())
    })

    it('should show an error message on the page', () => {
      document.querySelector('#duration').value = 10
      document.querySelector('#submit').click()
      setTimeout(() => {
        expect(document.querySelector('#message').textContent).toMatch('Could not create time entry on Productive')
      }, 100)
    })
  })

  describe('when time logging to productive succeeds', () => {
    beforeEach(done => {
      initializeApp(airtableBase(), productiveClient()).then(_ => done())
    })

    it('should show a success message on the page', () => {
      document.querySelector('#duration').value = 10
      document.querySelector('#submit').click()
      setTimeout(() => {
        expect(document.querySelector('#message').textContent).toMatch('Time logged successfully')
      }, 100)
    })
  })
})
