---
title: "Using k3sup (said 'ketchup') to bootstrap k3s"
date: 2021-08-19
draft: false
slug: k3s-bootstrap
city: Birmingham
toc: true
tags: [k3sup, k3s, raspberry-pi]
---

This is a short tutorial on how to set up a Kubernetes cluster on Raspberry Pis in < 2 minutes. I think this is one of the easiest ways to get up and running with Kubernetes.

TL;DR [k3sup](https://github.com/alexellis/k3sup) is an awesome way to bootstrap a k3s cluster in seconds.

### Introduction to k3sup (said 'ketchup')

k3sup was created to automate the manual process of setting up k3s. It's a lite-weight open-source project created by Alex Ellis. To get started, all you require is ssh access to the machine(s) you wish to run k3s on.

Check out the project on [GitHub.](https://github.com/alexellis/k3sup)

### Install k3sup

Super simple.

```sh
curl -sLS https://get.k3sup.dev | sh
sudo install k3sup /usr/local/bin/

k3sup --help
```

### Setup the server

To start off, you're going to want to setup the k3s server or "master" node. Using k3sup its super simple, don't forget to switch out `10.20.40.10` for your severs IP address.

```sh
k3sup install --ip 10.20.40.10 --user pi --ssh-key /path/to/.ssh/key 
```

Other options to consider:

- use `--context my-context` to specify a custom context name
- use `--merge --local-path $HOME/.kube/config` to merge Kube config into your local existing config.
- Consider `--k3s-extra-args` if you want to pass extra arguments to the k3s installer
    - I disabled the default servicelb and didn't deploy the default Traefik ingress controller as I wanted to deploy MetalLB and Traefik v2 `--k3s-extra-args '--disable servicelb --no-deploy traefik'`

You should now be able to check weather your node is up and running 

```sh
kubectl get nodes

NAME       STATUS   ROLES    AGE     VERSION
ef2d5f59   Ready    master   5d      v1.19.13+k3s1
```

### Join some workers to your server

Once we've set up the master node, we can now go ahead and join some worker nodes into the cluster, again using k3sup makes this easy.

```sh
k3sup join --ip 10.20.40.11 --server-ip 10.20.40.10 --user pi --ssh-key /path/to/.ssh/key 
```

Once thats completed you can check to see what state the node is in like we did before: 

```sh
kubectl get nodes
NAME       STATUS   ROLES    AGE     VERSION
93966602   Ready    <none>   4d23h   v1.19.13+k3s1
ef2d5f59   Ready    master   5d      v1.19.13+k3s1
```

and that's it! You've now got a two node raspberry pi cluster running k3s. If you face any issues, feel free to reach out, Alex has put together some troubleshooting steps in the [readme](https://github.com/alexellis/k3sup#troubleshooting).

Next up, we'll take a look at how you can use k3sup to deploy multi-master cluster with embedded etcd.
