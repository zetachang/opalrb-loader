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

# TODO: Report this issue to opal/opal
module Opal
  class Lexer
    def process_numeric
      @lex_state = :expr_end

      if scan(/([\d_]+\.[\d_]+\b|[\d_]+(\.[\d_]+)?[eE][-+]?[\d_]+\b)/) # FLOATS
        self.yylval = scanner.matched.gsub(/_/, '').to_f
        return :tFLOAT
      elsif scan(/([^0][\d_]*|0)\b/)                                 # BASE 10
        self.yylval = scanner.matched.gsub(/_/, '').to_i
        return :tINTEGER
      elsif scan(/0[bB](0|1|_)+/)                                    # BASE 2
        self.yylval = scanner.matched.to_i(2)
        return :tINTEGER
      elsif scan(/0[xX](\d|[a-f]|[A-F]|_)+/)                         # BASE 16
        self.yylval = scanner.matched.to_i(16)
        return :tINTEGER
      elsif scan(/0[oO]?([0-7]|_)+/)                                 # BASE 8
        self.yylval = scanner.matched.to_i(8)
        return :tINTEGER
      elsif scan(/0[dD]([0-9]|_)+/)                                  # BASE 10
        self.yylval = scanner.matched.gsub(/_/, '').to_i
        return :tINTEGER
      else
        raise "Lexing error on numeric type: `#{scanner.peek 5}`"
      end
    end
  end
end
