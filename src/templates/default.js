const Handlebars = require('handlebars')

Handlebars.registerHelper('link', function (text, url) {
  return new Handlebars.SafeString('<a href="' + Handlebars.escapeExpression(url) + '" target="_blank">' + Handlebars.escapeExpression(text) + '</a>')
})

Handlebars.registerHelper('plural', function (value, text) {
  return new Handlebars.SafeString(value + ' ' + text + (parseInt(value) === 1 ? '' : 's'))
})

export default function (args) {
  const template = Handlebars.compile(`
  <div id="productive_time_logger">
    {{#if message}}
    <div id="message" class="{{message.type}}">
      <p>{{ message.message }}</p>
      <hr>
    </div>
    {{/if}}
    {{#if okay}}
      <p><b>Logging against</b></p>
      <p>Person: <b id="person-email">{{person.email}}</b></p>
      <p>Project: <b id="project-name">{{link project.name project.url}}</b></p>
      <p>Budget: <b id="budget-name">{{link budget.name budget.url}}</b></p>
      <p>Service: <b id="service-name">{{service.name}}</b></p>

      <hr>

      <p>{{plural ticket.hours 'hour'}} spent on this ticket to date</p>
      <p>{{plural service.hours 'hour'}} of support time spent on this client since {{budget.start_date}}</p>

      <hr>

      <form>
        <label for="duration">Time spent</label>
        <input name="duration" id="duration" type="text" pattern="[0-9:]+" title="Duration in hours and minutes" placeholder="eg. 1:30">

        <label for="note">Ticket reference</label>
        <textarea name="note" id="note"></textarea>

        <button id="submit">Submit</submit>
      </form>
    {{/if}}
  </div>
  `)

  return template(args)
}
