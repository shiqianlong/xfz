from django.shortcuts import render


def more_index(request):
    return render(request,'more/more_index.html')