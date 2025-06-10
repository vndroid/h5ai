## 版本替换

构建出来的版本号自带标识，使用命令进行去除：

```sh
cd _h5ai
find . -type f -exec sed -i 's/0.30.0+000~0000000/0.30.0/g' {} \;
```

## 打包

使用 14.x 以上版本 Node.js 构建需要的选项 `--openssl-legacy-provider` 进行构建，也可以使用环境变量形式传递参数：

```sh
NODE_OPTIONS=--openssl-legacy-provider npm run build
```