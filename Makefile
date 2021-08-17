.DEFAULT_GOAL := run
.SILENT: # silence!!

export PATH := ./bin:$(PATH)

clean:
	rm -rf ./public || true
	rm -rf content/posts/* static/public/images/* || true

setup:
	go mod tidy
	mkdir -p bin
	curl -sL https://htmltest.wjdp.uk | bash
	chmod +x ./bin/*

run:
	hugo server --watch --buildFuture --cleanDestinationDir

ci: refresh
	hugo
	htmltest -c .htmltest.yaml ./public

avatar:
	wget -O static/avatar.jpg https://avatars.githubusercontent.com/u/3950254?s=400&u=d5e10830f2de3166a9727047671ed7453b05e719&v=4
	convert static/avatar.jpg \
		-bordercolor white -border 0 \
		\( -clone 0 -resize 16x16 \) \
		\( -clone 0 -resize 32x32 \) \
		\( -clone 0 -resize 48x48 \) \
		\( -clone 0 -resize 64x64 \) \
		-delete 0 -alpha off -colors 256 static/favicon.ico
	convert -resize x120 static/avatar.jpg static/apple-touch-icon.png

refresh: clean
	go run cmd/notion/main.go
