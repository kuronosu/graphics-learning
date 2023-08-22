
export function downloadData(data: string, filename: string) {
  const _id = "download-file";
  let $a = document.getElementById(_id) as HTMLAnchorElement;
  if ($a == null) {
    $a = document.createElement("a");
    $a.id = _id;
    $a.style.display = "none";
    document.body.appendChild($a);
  }

  const blob = new File([data], filename);
  const url = window.URL.createObjectURL(blob);
  $a.href = url;
  $a.download = blob.name;
  $a.click();
  window.URL.revokeObjectURL(url);
}

