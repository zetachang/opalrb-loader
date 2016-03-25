require "opal"
require "opal-source-maps"
require "opal-parser"

# MRI implement `begin/end while condition` differently 
# See issue: https://github.com/opal/opal/issues/575
module SourceMap
  module VLQ
    def self.encode(ary)
      result = []
      ary.each do |n|
        vlq = n < 0 ? ((-n) << 1) + 1 : n << 1
        loop do
          digit  = vlq & VLQ_BASE_MASK
          vlq  >>= VLQ_BASE_SHIFT
          digit |= VLQ_CONTINUATION_BIT if vlq > 0
          result << BASE64_DIGITS[digit]
          break unless vlq > 0
        end
      end
      result.join
    end
  end
end

# FIXME
# Pending upstream issue https://github.com/opal/opal/issues/1400
class Pathname
  def cleanpath
    `return #@path`
  end
end
