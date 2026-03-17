# Sheet Cheat 

```plantuml
@startuml NOM_DIAGRAMME

' Direction (optionnel)
left to right direction
top to bottom direction

' === Acteurs ===
actor ACTOR_1
actor ACTOR_2 as A2

' === Cas d'utilisation ===
(Se connecter)
(Gérer profil) as UC2
usecase "Commander une pizza" as UC3


' === Relations ===
' (flèche pleine dirigée)
ACTOR_1 --> UC1
' (flèche pleine non dirigée)
ACTOR_1 -- UC1
' (flèche pointillé)
UC2 .> UC1 : <<extend>>
UC1 .> UC3 : <<include>>
' (flèche pointillé avec passage au bloc suivant)
UC2 ..> UC1 : <<extend>>
UC1 ..> UC3 : <<include>>


' === Système ===
rectangle "Mon Système" {
  (Faire un achat) as UC4
  (Payer) as UC5
  UC4 --> UC5 : <<include>>
}

@enduml
```