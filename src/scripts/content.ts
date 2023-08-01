for (let i = 0; i < localStorage.length; i++) {
  console.log(localStorage.key(i));
  console.log(localStorage.getItem(localStorage.key(i) as string));
}
