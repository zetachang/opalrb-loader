require "opal"
require "opal-source-maps"
require "opal-parser"

# fixes https://github.com/opal/opal/issues/1400
class Pathname
  def cleanpath
    `return #@path`
  end
end
