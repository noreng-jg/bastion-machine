{
   test: /\.tsx?$/,
   exclude: /node_modules/,
   loader: 'ts-loader'
   resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    entry: "./src/index.tsx",
}
