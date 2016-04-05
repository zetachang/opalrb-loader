require "opal"
require "opal-source-maps"
require "opal-parser"
require "pathname"

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

# Backports from opal 0.10
unless Pathname.method_defined?(:+) && Pathname.method_defined?(:join)
  class Pathname
    def +(other)
      other = Pathname.new(other) unless Pathname === other
      Pathname.new(File.join(@path, other.to_path))
    end

    def join(*args)
      args.unshift self
      result = args.pop
      result = Pathname.new(result) unless Pathname === result
      return result if result.absolute?
      args.reverse_each {|arg|
        arg = Pathname.new(arg) unless Pathname === arg
        result = arg + result
        return result if result.absolute?
      }
      result
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
