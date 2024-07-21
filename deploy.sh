cd frontend
npm i 
npm run build
sudo rm -rf /var/www/jobs/*
sudo cp -r dist/* /var/www/jobs/
