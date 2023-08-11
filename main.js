
var storedData = [];

function getData() {
    $.ajax({
        url: 'http://localhost:5213/api/Parcels',
        method: 'GET',
        dataType: 'json',
        success: function (result) {
            console.log(JSON.stringify(result));

            storedData = result; // Verileri sakla

            // Tabloyu güncelle
            var tableBody = document.getElementById("veriGoster").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = ""; // Tabloyu temizle

            // Verileri tabloya ekle
            for (var i = 0; i < storedData.length; i++) {
                var row = tableBody.insertRow(i);
                var cellIl = row.insertCell(0);
                var cellIlce = row.insertCell(1);
                var cellMahalle = row.insertCell(2);
                var cellEdit = row.insertCell(3);
                var cellDelete = row.insertCell(4);

                cellIl.innerHTML = storedData[i].parcelIl;
                cellIlce.innerHTML = storedData[i].parcelIlce;
                cellMahalle.innerHTML = storedData[i].parcelMahalle;

                var editParcelButton = document.createElement('button');
                editParcelButton.textContent = 'Edit';
                editParcelButton.onclick = function () {
                    editParcel(storedData[i].Id);
                };
                cellEdit.appendChild(editParcelButton);

                var deleteParcelButton = document.createElement('button');
                deleteParcelButton.textContent = 'Delete';
                deleteParcelButton.onclick = function () {
                    deleteParcel(storedData[i].Id);
                };
                cellDelete.appendChild(deleteParcelButton);
            }
        },
        error: function (xhr, status, error) {
            console.log("Hata: " + error);
        }
    });
}

function refreshTable() {
    tableBody.innerHTML = "";
    for (let i = 0; i < storedData.length; i++) {
        var row = tableBody.insertRow(i);
        var cellIl = row.insertCell(0);
        var cellIlce = row.insertCell(1);
        var cellMahalle = row.insertCell(2);
        var cellEdit = row.insertCell(3);
        var cellDelete = row.insertCell(4);

        cellIl.innerHTML = storedData[i].ParcelIl;
        cellIlce.innerHTML = storedData[i].ParcelIlce;
        cellMahalle.innerHTML = storedData[i].ParcelMahalle;

        var editParcelButton = document.createElement('editbutton');
        editParcelButton.textContent = 'Edit';
        editParcelButton.setAttribute('data-id', storedData[i].Id);
        editParcelButton.addEventListener('click', editParcelButtonClick);
        cellEdit.appendChild(editParcelButton);

        var deleteParcelButton = document.createElement('deletebutton');
        deleteParcelButton.textContent = 'Delete';
        deleteParcelButton.setAttribute('data-id', storedData[i].Id);
        deleteParcelButton.addEventListener('click', deleteParcelButtonClick);
        cellDelete.appendChild(deleteParcelButton);
    }
}

function editParcelButtonClick(event) {
    var parcelId = event.target.getAttribute('data-id');
    editParcel(parcelId);
}

function deleteParcelButtonClick(event) {
    var parcelId = event.target.getAttribute('data-id');
    deleteParcel(parcelId);
}


function editParcel(parcelId) {
    // Önce düzenlemek istediğiniz parselin bilgilerini topluyoruz
    var updatedParcel = {
        ParcelIl: $('#city').val(),
        ParcelIlce: $('#district').val(),
        ParcelMahalle: $('#neighborhood').val()
    };

    $.ajax({
        url: 'http://localhost:5213/api/Parcels/' + parcelId, // Düzenlemek istediğimiz parselin ID'sini ekliyoruz
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(updatedParcel),
        success: function (result) {
            console.log('Parsel güncellendi:', JSON.stringify(result));
            getData(); // Veriyi güncelle
        },
        error: function (xhr, status, error) {
            console.log('Hata:', error);
        }
    });
}

function deleteParcel(parcelId) {
    $.ajax({
        url: 'http://localhost:5213/api/Parcels/' + parcelId, // Silmek istediğimiz parselin ID'sini ekliyoruz
        method: 'DELETE',
        success: function (result) {
            console.log('Parsel silindi:', JSON.stringify(result));
            getData(); // Veriyi güncelle
        },
        error: function (xhr, status, error) {
            console.log('Hata:', error);
        }
    });
}



function sendData() {
    var ParcelIl = $('#city').val();
    var ParcelIlce = $('#district').val();
    var ParcelMahalle = $('#neighborhood').val();
    var ParcelWkt = $('#roundedWkt').val();
    var data = {
        ParcelIl: ParcelIl,
        ParcelIlce: ParcelIlce,
        ParcelMahalle: ParcelMahalle,
        ParcelWkt: ParcelWkt
    };

    $.ajax({
        url: 'http://localhost:5213/api/Parcels',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (result) {
            console.log('Veri başarıyla eklendi:', JSON.stringify(result));
            getData();
        },
        error: function (xhr, status, error) {
            console.log('Hata:', error);
        }
    });
}


var dataToSend = {

};


document.addEventListener('DOMContentLoaded', function () {
    // Harita nesnesini oluşturun
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 2
        })
    });
    getData();

    // Vektör katmanını oluşturun
    const vectorSource = new ol.source.Vector();
    const vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayer);



    // Popup için Overlay nesnesini oluşturun
    const overlay = new ol.Overlay({
        element: document.getElementById('popup'), // Popup içeriği için HTML elementini belirtin
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });
    map.addOverlay(overlay);

    // "Parseli Kaydet" düğmesine basıldığında popup'ı kapatın ve değişiklikleri kaydedin
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', function () {
        overlay.getElement().style.display = 'none';

        // Metin alanlarından alınan değerleri kullanarak parseli kaydedin
        const cityValue = document.getElementById('city').value;
        const districtValue = document.getElementById('district').value;
        const neighborhoodValue = document.getElementById('neighborhood').value;

        // Burada parseli kaydetmek için gerekli işlemleri yapabilirsiniz
        // Örneğin, bu bilgileri bir veritabanına veya başka bir yere gönderebilirsiniz

        // Daha sonra bu değerleri console'da görüntüleyelim
        console.log('Şehir:', cityValue);
        console.log('İlçe:', districtValue);
        console.log('Mahalle:', neighborhoodValue);
    });

    // Harita üzerinde tıklandığında popup'ı kapatın
    map.on('click', function () {
        overlay.getElement().style.display = 'none';
    });



    // Çizim nesnesini oluşturun (Varsayılan olarak Polygon)
    let currentDrawType = 'Polygon';
    let draw;
    const format = new ol.format.WKT();

    function createDrawInteraction() {
        draw = new ol.interaction.Draw({
            source: vectorSource,
            type: currentDrawType
        });
        map.addInteraction(draw);

        function saveDrawingsToLocalStorage(drawings) {
            localStorage.setItem('drawings', JSON.stringify(drawings));
        }

        // Yerel depolamadaki çizimleri yükleme işlemi
        function loadDrawingsFromLocalStorage() {
            const drawingsJSON = localStorage.getItem('drawings');
            if (drawingsJSON) {
                return JSON.parse(drawingsJSON);
            } else {
                return [];
            }
        }

        // Veriyi saklamak için bir dizi oluşturun
        var storedDrawings = loadDrawingsFromLocalStorage();

        // Çizim tamamlandığında çalışacak işlevi tanımlayın
        draw.on('drawend', function (event) {
            const feature = event.feature;
            const geometry = feature.getGeometry();
            const extent = geometry.getExtent();
            const center = ol.extent.getCenter(extent);

            // Çizimin koordinatlarını WKT formatında alın
            const wkt = format.writeGeometry(geometry, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });

            const roundedWkt = roundWktCoordinates(wkt, 2);

            // Çizimi yerel depolamaya ekleyin
            storedDrawings.push(roundedWkt);
            saveDrawingsToLocalStorage(storedDrawings);

            // WKT formatındaki koordinatları konsola yazdırın
            console.log('Çizim Koordinatları (WKT formatında):', roundedWkt);

            // Çizimi vektör katmanına ekle
            const featureToAdd = new ol.Feature({
                geometry: geometry
            });
            vectorSource.addFeature(featureToAdd);

            // ParcelWkt'ye değeri aktarın
            $('#roundedWkt').val(roundedWkt);

            // Popup içeriğini güncelleyin
            const popupContent = document.getElementById('popup-content');
            if (popupContent) {
                overlay.setPosition(center);
                overlay.getElement().style.display = 'block';

                const cityInput = document.getElementById('city');
                const districtInput = document.getElementById('district');
                const neighborhoodInput = document.getElementById('neighborhood');
                cityInput.value = "Şehir adı";
                districtInput.value = "İlçe adı";
                neighborhoodInput.value = "Mahalle adı";
            }
        });


        function roundWktCoordinates(wkt, decimals) {
            const regex = /-?\d+\.\d+/g;
            const roundedWkt = wkt.replace(regex, match => parseFloat(match).toFixed(decimals));
            return roundedWkt;
        }
    }




    createDrawInteraction(); // İlk çizim işlemini oluşturun

    // Çizim türünü değiştirme işlevini tanımlayın
    document.getElementById('draw-type').addEventListener('change', function () {
        currentDrawType = this.value;
        map.removeInteraction(draw);
        createDrawInteraction(); // Yeni çizim türüne göre çizim işlemini oluşturun
    });

    // Harita üzerinde tıklanınca popup'ı kapatın
    overlay.getElement().addEventListener('click', function (event) {
        event.stopPropagation();
    });

});
