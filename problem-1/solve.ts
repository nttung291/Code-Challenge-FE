var sum_to_n_a = function (n: number) {
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n: number) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_recursive = function (n: number) {
  if (n <= 1) return n;
  return n + sum_to_n_recursive(n - 1);
};
