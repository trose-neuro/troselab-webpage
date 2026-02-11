require 'liquid'

module Jekyll
  module FileFilters
    # check if file exists
    def file_exists(file)
      return nil if file.nil? || file.to_s.strip.empty?
      path = File.join(Dir.getwd, file)
      # pass back filename if exists
      return File.file?(path) ? file : nil
    end

    # read text contents of file
    def file_read(file)
      return nil if file.nil? || file.to_s.strip.empty?
      path = File.join(Dir.getwd, file)
      return File.file?(path) ? File.read(path) : nil
    end
  end
end

Liquid::Template.register_filter(Jekyll::FileFilters)
