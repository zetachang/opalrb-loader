require "opal"
require "opal/version"
require "browser"
require "react"

# add rules in style.css to document
`require("style!css!./style.css")`

class HelloFromReact
  include React::Component
  
  def render
    div do
      h1 { "Hello from React!" }
      h2 { "Using Opal #{Opal::VERSION}" }
    end
  end
end

$document.ready do
  DOM {
    div.info {
      span.red "I'm all cooked up."
    }
  }.append_to($document['#opal-browser'])
  
  React.render(React.create_element(HelloFromReact), $document['#react'].to_n)
end
