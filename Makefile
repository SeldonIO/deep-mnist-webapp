SHELL=/bin/bash
IMAGE=seldoniotesting/deep_mnist_webapp
WEBAPP_IMAGE_VERSION=0.9
SELDON_PYTHON_PACKAGE_VERSION=2.0.6

Dockerfile: Dockerfile.in
	@cat Dockerfile.in | sed 's/%SELDON_PYTHON_PACKAGE_VERSION%/$(SELDON_PYTHON_PACKAGE_VERSION)/' > Dockerfile

build_image:Dockerfile
	docker build --force-rm=true -t ${IMAGE}:$(WEBAPP_IMAGE_VERSION) .

push_to_dockerhub:
	@docker login -u seldoniotesting && \
		docker push $(IMAGE)
	@docker login -u seldoniotesting && \
		docker push $(IMAGE):$(WEBAPP_IMAGE_VERSION)


clean:
	@rm -fv Dockerfile
