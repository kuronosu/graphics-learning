export default function li({
  text,
  classNames = [],
}: {
  text: string;
  classNames?: string[];
}) {
  const $li = document.createElement('li');
  $li.innerText = text;
  $li.classList.add(...classNames);
  return $li;
}