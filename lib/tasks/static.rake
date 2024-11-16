namespace :static do
  desc "Generate static files for GitHub Pages"
  task generate: :environment do
    # Create output directory
    output_dir = Rails.root.join('public')
    FileUtils.mkdir_p(output_dir)

    # Ensure manifest.json and service-worker.js exist in public
    ['manifest.json', 'service-worker.js'].each do |file|
      unless File.exist?(output_dir.join(file))
        puts "Warning: #{file} not found in public directory"
      end
    end

    # No need to copy icons since they're already in the right place
    puts "Files are ready in public directory"
    puts "\nContents of public/icons:"
    system('ls -la public/icons/')

    puts "\nYour static files are ready for GitHub Pages!"
    puts "Next steps:"
    puts "1. Create and switch to gh-pages branch: git checkout -b gh-pages"
    puts "2. Remove files from git but keep them on disk: git rm -r --cached ."
    puts "3. Add necessary files: git add public/"
    puts "4. Commit: git commit -m 'Initial gh-pages setup'"
    puts "5. Push: git push origin gh-pages"
  end
end