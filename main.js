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

    // Zoom-in ve Zoom-out butonlarının işlevselliğini ekleyin
    document.getElementById('zoom-in').addEventListener('click', function () {
        const view = map.getView();
        const zoom = view.getZoom();
        view.setZoom(zoom + 1);
    });

    document.getElementById('zoom-out').addEventListener('click', function () {
        const view = map.getView();
        const zoom = view.getZoom();
        view.setZoom(zoom - 1);
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

        // Çizim tamamlandığında çalışacak işlevi tanımlayın
        draw.on('drawend', function (event) {
            const feature = event.feature;
            const geometry = feature.getGeometry();
            const extent = geometry.getExtent();
            const center = ol.extent.getCenter(extent);

            // Çizimin koordinatlarını WKT formatında alın
            const wkt = format.writeGeometry(geometry, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });

            // WKT formatındaki koordinatları konsola yazdırın
            console.log('Çizim Koordinatları (WKT formatında):', wkt);

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
