// ==UserScript==
// @name         Auto AITL Corpo
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       Kobal (IG)
// @match        https://www.dreadcast.eu/Main
// @match        https://www.dreadcast.net/Main
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

/*
L'objectif de ce programme est de permettre, au clic sur une ligne du tableau des corporation dans l'AITL, de rentrer 'activite [entreprise]' dans un deck ouvert proche
*/

var listeCorporation = [
    "LA FORGE",
    "LA CRYPTE",
    "LE SILO",
    "SINS7 INDUSTRY",
    "LA CORNE D'ABONDANCE",
    "NEW HENEM",
    "MÉTAL NOIR",
    "ARMSTECH",
    "REBELTECK NO LOGIK",
    "MELTING POT TECHNOLOGY",
    "KROVTECH",
    "MISS IMMO",
    "FOXON",
    "L'HYDRE REBELLE",
    "YGGDRASIL",
    "EVANGELINE",
    "AGENCE MJ",
    "DISCORDE",
    "LA MUSE",
    "LA FABRIQUE",
    "SYNESTHESIA",
    "BLEACH",
    "T'HATI",
    "ZOHAR",
    "MISSDREAD",
    "HURRICANE"]
    
    var lignesDeck = 0;
    
    var deckWatcherActive = true;
    
    $(document).ready(function() {
    
        function writeToDeck($element,$nomCorpo,$commande)
        //Fonction écrivant dans le deck en question. le 'if' vérifie la présence d'un deck, et écrit dedans si le deck est trouvé. Si pas de deck présent, il ne fait rien
        {
            if (document.querySelector('.deck_main .ligne_ecriture input')) {
                $('.ligne_ecriture input').val($commande+" "+$nomCorpo);
                $('.ligne_ecriture input').focus();
            }
            $element.css({
                        "background-color": "transparent"
                    });
        };
    
        function waitForElmtoload(selector) {
        /*
        Fonction réalisant une 'promesse' pour vérifier le chargement d'un élément :  on ne peut éditer l'AITL que si il est chargé. Cela réalise donc une 'promesse' qui se résouds quand l'évènement devient existant
        Dans notre cas, c'est quand l'AITL, page des corporation est ouvert.
        */
        return new Promise(resolve => {
                if (document.querySelector(selector)) {
                    return resolve(document.querySelector(selector));
                }
    
                const observer = new MutationObserver(mutations => {
                    if (document.querySelector(selector)) {
                        resolve(document.querySelector(selector));
                        observer.disconnect();
                    }
                });
    
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }
    
        function traiteResultatDeck(elm) {
    
            if (elm.children.length > lignesDeck) {
                console.log("ligne écrite");
                var nbLastChild = elm.children.length - lignesDeck;
                console.log(nbLastChild);
                lignesDeck = elm.children.length;
                console.log(deckWatcherActive);
                //return resolve(elm.children.length);
            }
        }
    
        function deckWatcher(selector) {
        /*
        Fonction réalisant une 'surveillance' d'un deck pour réussir à trouver quand les lignes de ce dernier sont updated.
        */
        return new Promise(resolve => {
    
            waitForElmtoload(selector).then((elm) => {
                traiteResultatDeck(elm);
    
                const observerDeck = new MutationObserver(mutations => {
                    traiteResultatDeck(elm);
                });
    
                observerDeck.observe(elm, {
                    childList: true,
                    subtree: true
                });
            });
          });
        }
    
        function closeDeckWatcher(){
            deckWatcherActive=false;
    
        }
        /*
        -attendre que l'AITL, page corpo soit ouvert
        -obtenir pour chaque ligne le titre de la corporation
        -Créer une fonction 'onclick' pour chaque ligne qui permet de rentrer 'activite [corporation]' dans un deck ouvert.
        */
        waitForElmtoload('.corporations .texte table tbody').then((elm) => {
            var $tableauCorpo = $('.corporations .texte table tbody');
            $tableauCorpo.find("tr").each(function() {
                var $nomCorpo = $( this ).find("td").eq(1).html();
                var $casenumeroCorpo = $( this ).find("td").eq(0);
                var $casenomCorpo = $( this ).find("td").eq(1);
                var $casechiffreCorpo = $( this ).find("td").eq(2);
                var $casecapitalCorpo = $( this ).find("td").eq(3);
                console.log($nomCorpo.toUpperCase())
                if( listeCorporation.includes($nomCorpo.toUpperCase()))
                {
                    $casenomCorpo.css({
                        "background-color": "rgba(255,165,0,.3)"
                    });
                    $casechiffreCorpo.css({
                        "background-color": "rgba(255,165,0,.3)"
                    });
                    $casecapitalCorpo.css({
                        "background-color": "rgba(255,165,0,.3)"
                    });
                }
                $casenumeroCorpo.click(function(){ writeToDeck($(this),$nomCorpo,'activite'); });
                $casenomCorpo.click(function(){ writeToDeck($(this),$nomCorpo,'activite'); });
                $casechiffreCorpo.click(function(){ writeToDeck($(this),$nomCorpo,'chiffre'); });
                $casecapitalCorpo.click(function(){ writeToDeck($(this),$nomCorpo,'capital'); });
            });
    
        });
    
        //deckWatcher('.deck_main .zone_ecrit')
    
    
    
    });
    
        //**********************************************
        //INTERFACE DE CONFIGURATION UTILISATEUR
        //**********************************************
        var $databox = $('#zone_dataBox');
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //Constructeur de fenêtre de configuration
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var LOG_window = function () {
            var window_width = '560px';
            var window_height = '450px';
            var $main_widow = $('<div id="dcce_configwindow" onclick="engine.switchDataBox(this)"/>');
            $main_widow.draggable();
            $main_widow.addClass('dataBox focused ui-draggable');
            $main_widow.css({
                width: window_width,
                display: 'block',
                position: 'absolute',
                "z-index": '2',
            });
            for (var i = 1; i <= 8; i++) {
                $('<div class="dbfond' + i + '" />').appendTo($main_widow);
            }
            var $config_head = $('<div class="head ui-draggable-handle" ondblclick="$(\'#dcce_configwindow\').toggleClass(\'reduced\');" />').appendTo($main_widow);
            $('<div title="Fermer la fenêtre (Q)" class="info1 link close" onclick="engine.closeDataBox($(this).parent().parent().attr(\'id\'));">X</div>').appendTo($config_head);
            $('<div title="Reduire/Agrandir la fenêtre" class="info1 link reduce" onclick="$(\'#dcce_configwindow\').toggleClass(\'reduced\');">-</div>').appendTo($config_head);
            $('<div class="title">Deck Log</div>').appendTo($config_head);
            $('<div class="dbloader" />').appendTo($main_widow);
            var $config_content = $('<div class="content" style="height:' + window_height + '; overflow: auto"/>').appendTo($main_widow);
            //----------------------------------------
            //Widgets internes
            //----------------------------------------
            var $config_interface = $('<div />').appendTo($config_content);
            $config_interface.css({
                "margin-left": '3px',
                "font-variant": 'small-caps',
                color: '#fff',
                height: '100%',
                width: '98%',
            });
            //----------------------------------------
            //Configuration du défilement, auto-scroll
            //----------------------------------------
            var $autoconfig = $('<div />').appendTo($config_interface);
            var $title_people_BDD = $('<h2 class="couleur4 configTitre" />').appendTo($autoconfig);
            $title_people_BDD.text('Deck corporation log');
            $title_people_BDD.css({
                "margin-bottom": '5px',
                "text-align": 'center',
                "border-bottom": '1px solid',
                display: 'block',
                "font-size": '17px',
                "-webkit-margin-before": '0.83em',
                "-webkit-margin-after": '0.83em',
                "-webkit-margin-start": '0px',
                "-webkit-margin-end": '0px',
                "font-weight": 'bold',
                position: 'relative',
            });
    
    
            var $log_container = $('<div class="ligne"/>').appendTo($config_interface);
            $log_container.text('Log Deck : ');
            $log_container.css({
                display: 'inline-block',
                "margin-bottom": '15px',
                "margin-left": '5px'
            });
    
            var $autoconfig_radio_activate = $('<p></p>').appendTo($log_container);
            $autoconfig_radio_activate.css({
                margin: '0 5px',
            });
            this.$window = $main_widow;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //FIN Constructeur de fenêtre de log
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
    
    
        //---------------------------------------------------
        //Ajout d'un item au menu bandeau de DC
        //---------------------------------------------------
    
    
    
        var $params_menu = $('.menus > .account');
        console.log($params_menu);
        var $newSeparator_config = $('<li class="separator"></li>').prependTo($('#bandeau ul.menus'));;
        var $LOGWindow = $('<li />').prependTo($('#bandeau ul.menus'));;
        $LOGWindow.text("CorpoLog");
        $LOGWindow.addClass('link couleur5');
    
        $LOGWindow.click(function () {
            //Fermeture des autres instances de paramétrage ouvertes
            engine.closeDataBox('LOG_window');
            var $MainWindow = new LOG_window();
            $databox.append($MainWindow.$window);
        });
    
    
    /*
    Bug / upgrades:
    
    - si plusieurs decks ouverts, le programme écrit dans TOUT les decks (testé)
    - La colonne avec les titre du tableau est affecté par le 'onclick'
    - si l'ATIL est fermé, le programme ne réponds plus.
    
    */