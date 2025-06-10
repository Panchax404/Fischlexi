const fishExamples = [
  {
    // Fisch 1: Neon Tetra
    fishData: {
      name: "Neon Tetra",
      slug: "neon-tetra",
      latin_name: "Paracheirodon innesi",
      common_other_names: ["Neonsalmler"],
      image_url_main: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Paracheirodon_innesi.jpg/640px-Paracheirodon_innesi.jpg", // Beispiel-URL
      image_gallery_urls: [],
      description_general: "Der Neon Tetra ist ein kleiner, sehr beliebter Süßwasserfisch, bekannt für seinen leuchtend blauen Längsstreifen und den roten Streifen am Hinterkörper. Er ist ein friedlicher Schwarmfisch.",
      description_habitat_details: "Stammt aus Schwarzwasserflüssen des oberen Amazonasbeckens in Peru, Kolumbien und Brasilien. Diese Gewässer sind oft weich, sauer und durch Huminstoffe dunkel gefärbt.",
      description_care_aquarium: "Benötigt ein gut bepflanztes Aquarium mit gedämpftem Licht und einigen freien Schwimmbereichen. Dunkler Bodengrund hebt seine Farben hervor. Sauberes Wasser ist wichtig.",
      description_social_behavior: "Sehr friedlich und gesellig. Sollte unbedingt in einem Schwarm von mindestens 10-15 Tieren gehalten werden, um Stress zu vermeiden und natürliches Verhalten zu zeigen.",
      description_breeding: "Die Zucht gilt als mittelschwer. Benötigt sehr weiches, saures Wasser und ein separates Ablaichbecken. Die Eier sind lichtempfindlich.",
      size_cm_min: 3.0,
      size_cm_max: 4.0,
      lifespan_years_min: 3,
      lifespan_years_max: 5,
      water_temperature_min_c: 21.0,
      water_temperature_max_c: 27.0,
      water_ph_min: 5.0,
      water_ph_max: 7.0,
      water_hardness_dh_min: 1.0,
      water_hardness_dh_max: 12.0,
      aquarium_min_liters: 60,
      aquarium_min_edge_length_cm: 60,
      is_published: true,
    },
    relations: {
      primary_habitat_name: "Schwarzwasserfluss",
      difficulty_level_name: "Anfängerfreundlich",
      keeping_type_names: ["Schwarmhaltung (ab 10 Tieren)"],
      origin_names: ["Amazonasbecken", "Peru", "Kolumbien"],
      feeding_category_names: ["Omnivor (Allesfresser)"],
      food_type_names: ["Flockenfutter", "Feines Granulatfutter", "Lebendfutter (Artemia)", "Frostfutter (Mückenlarven)"],
      swimming_zone_names: ["Mittlere Wasserregion"],
    }
  },
  {
    // Fisch 2: Guppy
    fishData: {
      name: "Guppy",
      slug: "guppy",
      latin_name: "Poecilia reticulata",
      common_other_names: ["Millionenfisch"],
      image_url_main: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Poecilia_reticulata_bottom_PNG.png/640px-Poecilia_reticulata_bottom_PNG.png",
      description_general: "Guppys sind lebendgebärende Zahnkarpfen und zählen zu den farbenfrohsten und variabelsten Süßwasserfischen. Männchen sind meist kleiner und prächtiger gefärbt als Weibchen.",
      description_habitat_details: "Ursprünglich aus dem nordöstlichen Südamerika und einigen Karibikinseln. Sie bewohnen eine Vielzahl von Habitaten, von klaren Bächen bis hin zu leicht brackigen Mündungsgebieten.",
      description_care_aquarium: "Sehr anpassungsfähig und relativ einfach zu halten. Ein Aquarium mit Bepflanzung und etwas freiem Schwimmraum ist ideal. Regelmäßige Wasserwechsel sind förderlich.",
      description_social_behavior: "Friedlicher Fisch, der gut in Gesellschaftsaquarien gehalten werden kann. Männchen können untereinander rivalisieren, aber meist ohne ernsthafte Verletzungen. Vermehrt sich sehr leicht.",
      description_breeding: "Sehr einfache Zucht, da lebendgebärend. Weibchen können Sperma speichern und mehrmals ohne erneute Befruchtung werfen. Jungfische sollten vor den Eltern geschützt werden.",
      size_cm_min: 3.0,
      size_cm_max: 6.0,
      lifespan_years_min: 1,
      lifespan_years_max: 3,
      water_temperature_min_c: 22.0,
      water_temperature_max_c: 28.0,
      water_ph_min: 6.5,
      water_ph_max: 8.0,
      water_hardness_dh_min: 10.0,
      water_hardness_dh_max: 30.0,
      aquarium_min_liters: 54,
      aquarium_min_edge_length_cm: 60,
      is_published: true,
    },
    relations: {
      primary_habitat_name: "Süßwasserbäche und -flüsse",
      difficulty_level_name: "Anfängerfreundlich",
      keeping_type_names: ["Gruppenhaltung (ab 3-5 Tieren)"], // Kann auch als Schwarm
      origin_names: ["Nordöstliches Südamerika", "Trinidad und Tobago", "Barbados"],
      feeding_category_names: ["Omnivor (Allesfresser)"],
      food_type_names: ["Flockenfutter", "Granulatfutter", "Pflanzliche Kost (Spirulina)", "Lebendfutter (Mückenlarven)"],
      swimming_zone_names: ["Obere Wasserregion", "Mittlere Wasserregion"],
    }
  },
  {
    // Fisch 3: Antennenwels (Blauer Antennenwels)
    fishData: {
      name: "Blauer Antennenwels",
      slug: "blauer-antennenwels", // Eindeutiger als nur "antennenwels"
      latin_name: "Ancistrus sp. 'L144'", // Beispiel für eine häufige Variante
      common_other_names: ["LDA 16", "Ancistrus"],
      image_url_main: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ancistrus_ temática_01.jpg/640px-Ancistrus_ temática_01.jpg",
      description_general: "Der Blaue Antennenwels ist ein beliebter Harnischwels, bekannt für seine Fähigkeit, Algen zu fressen. Männchen entwickeln im Alter ausgeprägte 'Antennen' (Tentakel) am Kopf.",
      description_habitat_details: "Stammt aus schnell fließenden, sauerstoffreichen Flüssen und Bächen Südamerikas, oft in Holzansammlungen oder Felsspalten.",
      description_care_aquarium: "Benötigt ein Aquarium mit ausreichend Versteckmöglichkeiten (Wurzeln, Höhlen) und guter Filterung. Er ist hauptsächlich dämmerungs- und nachtaktiv. Eine Wurzel zum Abraspeln ist wichtig für die Verdauung.",
      description_social_behavior: "Grundsätzlich friedlich gegenüber anderen Fischarten. Männchen können untereinander territorial sein, besonders wenn Höhlen knapp sind. Kann einzeln oder als Paar gehalten werden.",
      description_breeding: "Relativ einfach zu züchten. Das Männchen bewacht und pflegt die Eier, die typischerweise in einer Höhle abgelegt werden.",
      size_cm_min: 10.0,
      size_cm_max: 15.0,
      lifespan_years_min: 5,
      lifespan_years_max: 12,
      water_temperature_min_c: 23.0,
      water_temperature_max_c: 28.0,
      water_ph_min: 6.0,
      water_ph_max: 7.5,
      water_hardness_dh_min: 2.0,
      water_hardness_dh_max: 20.0,
      aquarium_min_liters: 80,
      aquarium_min_edge_length_cm: 80,
      is_published: true,
    },
    relations: {
      primary_habitat_name: "Schnell fließende Flüsse (Südamerika)",
      difficulty_level_name: "Anfängerfreundlich",
      keeping_type_names: ["Einzelhaltung", "Paarhaltung"],
      origin_names: ["Südamerika", "Amazonaszuflüsse"],
      feeding_category_names: ["Herbivor (Pflanzenfresser)", "Limnivor (Aufwuchsfresser)"],
      food_type_names: ["Welstabletten", "Algenblätter", "Gemüse (Gurke, Zucchini)", "Holz (zum Raspeln)"],
      swimming_zone_names: ["Untere Wasserregion / Bodenorientiert"],
    }
  },
  {
    // Fisch 4: Skalar
    fishData: {
      name: "Skalar",
      slug: "skalar",
      latin_name: "Pterophyllum scalare",
      common_other_names: ["Segelflosser"],
      image_url_main: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pterophyllum_scalare_male.jpg/640px-Pterophyllum_scalare_male.jpg",
      description_general: "Der Skalar ist ein majestätischer Buntbarsch mit hohem, seitlich stark abgeflachtem Körper und langen, segelartigen Flossen. Es gibt viele Zuchtformen mit unterschiedlichen Farben und Flossenformen.",
      description_habitat_details: "Stammt aus dem Amazonasbecken und seinen Nebenflüssen. Bevorzugt ruhige, langsam fließende Gewässer mit dichter Vegetation, z.B. unter überhängenden Wurzeln oder zwischen hohen Wasserpflanzen.",
      description_care_aquarium: "Benötigt ein hohes Aquarium (mind. 50-60 cm Höhe) aufgrund seiner Körperform. Eine dichte Bepflanzung mit robusten Pflanzen und freier Schwimmraum sind wichtig. Gute Wasserqualität ist entscheidend.",
      description_social_behavior: "Kann als Jungfisch in Gruppen gehalten werden, aus denen sich Paare bilden. Erwachsene Paare können territorial sein, besonders während der Brutpflege. Kann kleinere Fische fressen.",
      description_breeding: "Offenbrüter. Laicht auf flachen Steinen oder breiten Pflanzenblättern. Beide Elternteile betreiben intensive Brutpflege. Die Aufzucht der Jungfische erfordert etwas Erfahrung.",
      size_cm_min: 12.0, // Länge
      size_cm_max: 15.0, // Höhe bis 25cm
      lifespan_years_min: 8,
      lifespan_years_max: 15,
      water_temperature_min_c: 24.0,
      water_temperature_max_c: 30.0,
      water_ph_min: 6.0,
      water_ph_max: 7.5,
      water_hardness_dh_min: 3.0,
      water_hardness_dh_max: 15.0,
      aquarium_min_liters: 200, // Für ein Paar
      aquarium_min_edge_length_cm: 100, // Höhe wichtiger
      is_published: true,
    },
    relations: {
      primary_habitat_name: "Ruhige, pflanzenreiche Amazonasgewässer",
      difficulty_level_name: "Fortgeschrittene",
      keeping_type_names: ["Paarhaltung", "Gruppenhaltung (ab 3-5 Tieren)"], // Junge in Gruppe, adulte Paare
      origin_names: ["Amazonasbecken", "Brasilien", "Peru"],
      feeding_category_names: ["Karnivor (Fleischfresser)", "Omnivor (Allesfresser)"],
      food_type_names: ["Lebendfutter (Mückenlarven, Artemia)", "Frostfutter (Muschelfleisch, Krill)", "Hochwertiges Granulatfutter"],
      swimming_zone_names: ["Mittlere Wasserregion"],
    }
  },
  {
    // Fisch 5: Kampffisch (Betta)
    fishData: {
      name: "Kampffisch",
      slug: "kampffisch",
      latin_name: "Betta splendens",
      common_other_names: ["Siamesischer Kampffisch", "Betta"],
      image_url_main: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Betta_splendens_Show-Betta.jpg/640px-Betta_splendens_Show-Betta.jpg",
      description_general: "Der Siamesische Kampffisch ist bekannt für seine prächtigen Farben und langen Flossen bei den Männchen. Er ist ein Labyrinthfisch, d.h. er kann atmosphärischen Sauerstoff atmen.",
      description_habitat_details: "Ursprünglich aus flachen, stehenden oder langsam fließenden Gewässern Südostasiens, wie Reisfeldern, Sümpfen und Gräben, oft mit dichter Vegetation.",
      description_care_aquarium: "Männchen müssen unbedingt einzeln gehalten werden, da sie extrem aggressiv gegenüber Artgenossen (besonders anderen Männchen) sind. Benötigt ein kleines, gut abgedecktes Aquarium (springen!) mit vielen Pflanzen und Verstecken. Keine starke Strömung.",
      description_social_behavior: "Männchen sind untereinander unverträglich. Weibchen können manchmal in Gruppen gehalten werden ('Sorority'), aber auch hier ist Vorsicht geboten. Gegenüber friedlichen, nicht flossen-zupfenden Fischen anderer Arten meist tolerant.",
      description_breeding: "Schaumnestbauer. Das Männchen baut ein Schaumnest an der Wasseroberfläche und betreut die Brut. Die Zucht ist faszinierend, aber erfordert ein separates Zuchtbecken und Fingerspitzengefühl.",
      size_cm_min: 5.0,
      size_cm_max: 7.0,
      lifespan_years_min: 2,
      lifespan_years_max: 4,
      water_temperature_min_c: 24.0,
      water_temperature_max_c: 30.0,
      water_ph_min: 6.0,
      water_ph_max: 7.5,
      water_hardness_dh_min: 2.0,
      water_hardness_dh_max: 15.0,
      aquarium_min_liters: 25, // Für Einzelhaltung Männchen
      aquarium_min_edge_length_cm: 30,
      is_published: true,
    },
    relations: {
      primary_habitat_name: "Stehende Gewässer Südostasien (Reisfelder)",
      difficulty_level_name: "Anfängerfreundlich", // Einzelhaltung Männchen
      keeping_type_names: ["Einzelhaltung"], // Für Männchen
      origin_names: ["Südostasien", "Thailand", "Kambodscha"],
      feeding_category_names: ["Karnivor (Fleischfresser)"],
      food_type_names: ["Spezielles Bettafutter (Granulat/Flocken)", "Lebendfutter (Mückenlarven)", "Frostfutter (Artemia)"],
      swimming_zone_names: ["Obere Wasserregion", "Mittlere Wasserregion"],
    }
  },
];

module.exports = { fishExamples }; // Damit es im Skript importiert werden kann