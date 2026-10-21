"""Fetch public traces into ./data  (run:  python download.py azure_functions)"""
import sys, tarfile, urllib.request, pathlib

DATA = pathlib.Path(__file__).parent / "data"
AZURE_FN = ("https://github.com/Azure/AzurePublicDataset/releases/download/"
            "dataset-functions-2019/azurefunctions_dataset2019_azurefunctions-dataset2019.tar.xz")

def azure_functions():
    DATA.mkdir(exist_ok=True)
    out = DATA / "azurefunctions2019.tar.xz"
    if not out.exists():
        print("Downloading Azure Functions 2019 (CC-BY) ...")
        urllib.request.urlretrieve(AZURE_FN, out)
    dest = DATA / "azure_functions"
    dest.mkdir(exist_ok=True)
    with tarfile.open(out) as t:
        t.extractall(dest)
    print("Extracted to", dest)

def alibaba():
    print("""Alibaba 2017: github.com/alibaba/clusterdata -> cluster-trace-v2017 (follow the
download instructions in that folder's README; the files are not hosted in git).
Put batch_task.csv and batch_instance.csv in  data/alibaba2017/ .""")

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ["azure_functions", "alibaba"]:
        print("Usage: python download.py [azure_functions | alibaba]")
    else:
        {"azure_functions": azure_functions, "alibaba": alibaba}[sys.argv[1]]()
