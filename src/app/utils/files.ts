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
  document.body.removeChild($a);
}

export function uploadData(
  onLoad: (text: string) => void,
  onError?: () => void
) {
  // const _id = "upload-file";
  // let $input = document.getElementById(_id) as HTMLInputElement;
  const $input = document.createElement("input");
  $input.type = "file";
  $input.accept = ".txt";
  $input.style.display = "none";
  document.body.appendChild($input);
  if ($input == null) {
  }
  $input.click();
  $input.addEventListener("change", () => {
    if ($input.files != null && $input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        onLoad(text);
        document.body.removeChild($input);
      };
      reader.readAsText($input.files[0]);
    } else {
      onError?.();
    }
  });
}
