from typing import List

import json
import os
import random
import statistics
import collections

from ..utils import *
from ..doc_sketch import DocSketchGenerator
from ..doc_comparator import DocComparator
from ..binary_classif import *

article_source_ids = [
    "0177c4f6-ec39-47c0-9c14-5b0f6bde9f8a",
    "02b3cb5a-3374-409f-9769-cd47107c8fb3",
    "04e5cd98-ad24-4155-89f2-a0ac8b127194",
    "05852640-fbd1-43dc-a6d8-ddc53bfc5438",
    "06d4b590-0e95-470a-bc23-18ca72889ec5",
    "0b21de64-0aff-4850-bbd1-160000e0d6a4",
    "0f438da9-f52c-4cff-ad05-c044eb7a97c5",
    "0f8cedf4-e642-40a2-ace8-34c253805b52",
    "11f89e65-f390-4ca6-b040-973555212e34",
    "120c857a-c722-408e-a42a-39b44bd794ca",
    "143e2c30-8353-4805-af28-e81c1c804024",
    "14d9c6f0-b1cf-4915-8a89-ea4a6c33278d",
    "1a2c0663-f450-494c-b24a-d2b9f81652ea",
    "1cbfd8b4-6e2b-46f5-bfb1-b781028efdaa",
    "1ce92b08-f7ff-4470-990a-e4870bff4831",
    "1eabb65a-6e65-457b-ad45-40a0d37e293b",
    "1edb67af-eff0-4f7c-9411-5907be0df8d6",
    "24bf529d-c46b-4802-aa80-5107e88531df",
    "28b93e77-df96-4985-ae8b-140c87c1c9a5",
    "2b7409bb-cbf0-40bd-95a1-7044c9b9aa6d",
    "2cf83e5e-60a7-4f28-b60c-71204137c01e",
    "2da59901-28a7-4d4e-96de-05bff55512ee",
    "35d4bcdb-c4e7-40dc-b50d-23f2c297ebe5",
    "371bef97-6238-40ca-aec6-c0bbd1b287a5",
    "3d02576c-eed2-44aa-a9b6-dba5764dca88",
    "3fea19aa-3e31-4c2d-9cb1-4ffe0ef73314",
    "40c8ca03-c86f-4ec4-bed6-2ed3added550",
    "4152ed85-9172-4745-8f41-17654a4bf5e1",
    "418beb72-6592-47f9-b6a8-c7c792157955",
    "46328d70-2801-416d-b989-f7915022543a",
    "4aa67109-0f7e-482c-bc61-783526a2a0e9",
    "4c9a242a-866b-4ecf-981a-3939fe867a5e",
    "4d99aa59-7c15-46a2-a15a-44728745658a",
    "4ef9ae25-24d3-4245-b248-e2b4c40b6c66",
    "549d8a4e-e8b8-4c48-ae63-b79282794752",
    "55e03451-e424-41e0-91e9-960af51b6919",
    "5658cfe1-e854-4a92-8640-222d55dbacdf",
    "5664db2a-dba4-4d3c-bead-fe4d67e9c6ee",
    "587a2fa2-9e6b-4bbe-b3e0-1b7cb7b35ee5",
    "5a557290-b4ce-453a-b77e-1cd188c77ac8",
    "5b55b1d6-c22c-4f4d-80d2-596e1a88a979",
    "5cc1de40-0f7a-41e4-a5d9-0677847c0912",
    "5f48014d-ca4c-4e92-81da-c576a1c37c4f",
    "602f6a4e-e2fe-47f2-881c-4b9cc66a4c09",
    "61170c5c-7683-44a5-936e-637d672236ff",
    "68a0af3e-8b6d-4ad0-9995-064db4e4047a",
    "6d10085d-552f-4db6-9543-e72ca0cc65b3",
    "6d697ab7-11c4-4107-895c-bea64b6db358",
    "6e898abc-c14f-46e6-8b00-0d58c87a79f7",
    "6e926d6e-0d19-4345-8119-668523176aff",
    "6f7e0f36-3a45-43b7-9b30-f273d0ce21d4",
    "73ee17b4-f880-4181-a61c-187863e6af0b",
    "75d9442c-9afc-442f-9fab-d39ba0e37799",
    "790bedd1-49c0-4228-abde-e561db41ed15",
    "7c68a8d2-d467-4928-8067-8ef6e8d82caf",
    "7e88bbb5-f05e-4dc2-8c36-e0bbc7e56077",
    "7ebd7a09-68b9-4967-ad01-bd839ccbba6d",
    "80b0257f-c8f9-487f-85b9-3a47e6f1b221",
    "8564eff1-8333-4330-80be-4dfdc6c61ab9",
    "8a62e4d0-5cff-4af2-92d5-1f1d728b4de8",
    "8ebe65cd-5dd0-41f7-b552-c098189c7e88",
    "909a1212-476c-437d-9f34-e219ab7bdb00",
    "916e277b-583d-4bb1-ade8-ed1ec940edbe",
    "9174e993-8ae6-4965-8896-2709160507a4",
    "93f48f09-2c27-414f-a146-b06e4b7df410",
    "973af99e-0261-4c26-afd7-194d1b49cab3",
    "99dcb73a-0ae8-48a9-93bd-119459b48a44",
    "9a03eafa-1b03-4cc4-a744-2537431aee85",
    "9b0b6e27-7d4b-4d8f-a8de-e74707ca5be8",
    "9b5d83f7-0872-4eba-99c3-0f62c6730a0e",
    "9f029b82-5c0a-4bd7-9f4f-84891a87b49a",
    "9f2d5d44-14a1-45d6-bed4-32b32b08f366",
    "a0317640-37e4-43e0-8391-9acc7e1860a9",
    "a2085517-4fb6-4fa0-8a34-081f26ff8259",
    "a2d73ab1-b912-40ff-8369-d6d763161ff8",
    "a38bbf57-e369-4cc8-9b23-a1735797e783",
    "a4db5fa5-8f59-4b16-b006-12d3be29eefe",
    "a4ef0dc3-f21c-430a-9ad5-4db79c7f7c9c",
    "a6e721a6-7e73-457c-83b6-63de998df8a9",
    "a8759820-a727-4c7f-ad1a-8f4a88e2fbcc",
    "abb83892-3d53-4a50-b860-751c09d20bbe",
    "ac9d1416-5b68-475d-8371-c0f1c02fe46f",
    "ad662e19-84b1-45a8-a410-0c19a4f36d89",
    "af623a43-7ae7-4673-88ad-c277c16c50e9",
    "af7c4dbf-8e60-492d-a7fa-d457d291489f",
    "b0363140-1194-4fd8-a33b-5d05ca3ea97e",
    "b37ee1cb-66a4-48f2-b3d9-c565864a3fd2",
    "b3af55a0-da57-4b45-9020-0123eebcb36f",
    "b3efe84c-f101-4418-9b1f-9ac61a33421e",
    "b8af731b-a18e-4d17-82e8-d23506f992f2",
    "b953eecb-c656-4975-a3ab-458ecaf1d3de",
    "ba1b7f43-43ac-428d-9bcd-c08ed2d59609",
    "ba4a7aaa-5067-4a72-8dec-23280bc85d06",
    "bc4297ff-527f-4f83-b9ba-94a795732ebb",
    "bcb61ec3-cf1c-4a8a-b9eb-e7f784c75503",
    "be708c25-6071-4d22-a520-10b547355d35",
    "c2550d45-b501-4f92-a382-8fb992987b0e",
    "c43a0a12-95c6-40e6-9ad8-0e9d8f1a3779",
    "c4a646b2-218b-46d8-a384-05c607f1bc38",
    "c64c6e5c-1076-43e0-949a-e16c53a09fbd",
    "c74faded-7e33-46d9-92f0-342bd7bf86e4",
    "c87f5cea-ea36-42a7-9762-56fa7f6c4bdb",
    "c9a57180-5df7-4aad-aabe-6027ca5e996a",
    "cb90413a-fa36-41a0-97a0-aff234ef94d0",
    "cc62fbae-0c44-4ce0-a84a-b717dcf56a49",
    "cce4c9bb-95ab-4264-b3fe-e2bcc304e776",
    "cd190f43-0d4b-41d4-ad63-1858a02332ea",
    "d23f07af-1461-47bb-a7f5-007d9ebfdd39",
    "d381ab05-0f98-4ea3-9975-300b8867e877",
    "d3e503b2-8093-4b19-8209-2cf1b657be03",
    "d4f81e07-c9e9-40d4-a32b-7b52fb172494",
    "d6ec6a3e-5f19-4e16-a048-525efabac4dd",
    "d7388f31-ee41-4e4f-80ca-307d7246c891",
    "d81a6781-a045-466d-a7b8-2e2cfe88442f",
    "d98bda39-6d82-44db-83fc-2d8917870a2f",
    "db32fc71-0eff-48d9-af58-412947b1da2d",
    "ddd360e7-92d6-4be4-9662-569975f9df95",
    "dfa96f02-677a-4a81-8973-74e8a080b953",
    "e0b3e37c-1d5b-4853-b5e5-ef0bbc1f0a3a",
    "e0b4aeca-bca6-4ba7-9c46-c1ef8c6cbee0",
    "e195cced-4d46-4e1c-a70d-2a2b16f9c4f0",
    "e2239c2e-658f-42cf-b6b4-eb04d19075de",
    "e6988ca2-f8e7-4693-98e3-a140f0450b4f",
    "e6ca6e72-8049-41f7-bd94-38f022002758",
    "e732ac6d-4e43-4f7a-bcb3-1ab106a08421",
    "e7a72190-9116-40b2-8469-011ed6373a7c",
    "e9695f55-9870-426b-9758-c052dafac2a2",
    "e9a72960-7da1-4d63-b18e-cca26e000f89",
    "eabd088e-96d4-44d4-9468-bbd1cd3de6a7",
    "ed7215bb-6093-438f-9db7-77e604792c06",
    "ed95ddbf-2e33-4f14-a76a-30aa36d24bbc",
    "f2f7c8b1-731b-4f9c-9e33-d2dbc2a5fa23",
    "f3843795-cc26-45ae-8d83-ef00a5daa5b8",
    "f3e5fbe9-ecfe-4ef4-9f26-a7706caa2959",
    "f403e848-22b6-47db-a4c9-9abeead0baab",
    "f49e969e-1fe8-4563-8457-99f436d5f53c",
    "f6bf6686-cd8d-46be-8963-dcbdeab3c560",
    "f96c711d-6ea9-4977-9158-8bd99566131d",
    "fafbb093-de74-4c5a-93a3-881ac587e82f",
    "fc03dd70-5b1a-4140-ba63-43e829ee4767",
    "fda5b9cf-2dfa-43e3-8a35-566d1a170e9e",
    "fe2019a0-a973-4a3d-b291-6793a9e5a244",
    "713ba105-f784-497c-85eb-ac951f524a98",
    "d92ccf0e-1d86-4e4f-a72e-1719b6909c3d",
    "47d2a755-0af9-44c9-bace-dbf0851f7009",
    "f5a402b6-a16c-4ea4-badf-fca20da25c4d",
    "ec1490ad-fbf5-47b8-8eea-2b6eaaba6c01",
    "a586ebd2-ad8e-4a43-8ee3-1eed96e3de6a",
    "c8f1b90d-45aa-4dc1-b5fc-5f0464598173",
    "fc1f0e05-8d18-47d4-8075-579dcfcf9ca7",
    "9b54bb4d-df9f-450e-9bc9-71e20cf40d35",
    "2740ab46-2f4e-47c9-b85d-df72b2c81c04",
    "75dd2c17-9c21-4ff1-83da-bd762c642c26",
    "d1361d78-9c1b-4d4c-8568-41d958b0d39d",
    "66b5f220-c98e-4563-90d8-be3068152536",
    "a39e4264-3c34-45f0-a10c-03cd5930289f",
    "ba1020a3-ea5d-48e8-a013-7bf402aa4cab",
    "3527437a-9363-417d-9fa8-3eaa8283917d",
    "11f3ea92-6a3b-4e9a-8eca-ccd8e187bf65",
    "dbf2828b-18fa-4260-a04e-59adbe86d519",
    "64e2b925-4fab-4b7f-93c6-74bdc024364c",
    "1c6438ba-a81f-4259-99ea-d61a79b8ccf6",
    "e9b1f765-cd3c-40ea-8319-f22e10788a9d",
    "d053c0ac-ccd5-4aef-9598-ecbbc93b7083",
    "f6c69378-b465-4984-b652-1620ca14e81e",
    "948c6ba1-f641-4ca2-9af8-b2593f986a17",
    "11d9ffa9-787a-4268-a14d-ffddbaa45372",
    "500acb72-f094-43e6-9ece-2fde4c7b3360",
    "5e938381-a9ec-4548-a444-80b0949136b9",
    "8fd3f56a-1c63-41cc-a08f-887fbf8ddea8",
    "beba068a-939d-44c9-bec2-9d25ecf7946e",
    "0caf967c-fe4a-419b-b71a-48e57c2ddb2f",
    "02509ee5-f3fc-43ac-9e25-b168861d989b",
    "63d69cd5-552a-4933-b148-6c865b5e81f0",
    "29d19d7c-444a-4e8c-a3a8-6c07d276efcf",
    "b7f20ddd-6ad8-4855-b4d1-dd58f04aaa87",
    "e79350ec-000a-44ab-9db6-5f4bff652971",
    "3f25d9c1-752d-431b-ba6f-4a11c904171c",
    "00b594ec-2221-4028-bf1b-203447fe4933",
    "d9dceef5-de13-4486-986f-74beee6e37f5",
    "85ed5a9b-3978-4372-adfb-b9ca2b9f0aaa",
    "c503d5dc-9c31-44a4-95a2-7cdf8ed09b85",
    "006ba37b-af8f-497f-ac1d-511d680317c3",
    "c6e8e24e-606a-4455-9cb9-1caa4bf6043e",
    "2753b5cf-e783-48bd-9465-97034a493564",
    "8009d3cc-bc36-4d41-9fd7-e63616643ec8",
    "1f583372-cb7a-44b7-baf8-75c25c1b06ca",
    "81f9a542-97fa-454d-ba29-f75770b4e919",
    "7f3a704d-f4a8-48f2-a3b2-e40e00bf8084",
    "f0618194-fc64-4d21-8ae4-fdfb59ee6495",
    "a4339574-18e0-4b08-be62-4a8f6541cade",
    "8c6d7e76-cd36-42f4-b177-1080ff69cfce",
    "8c7ee711-c64e-474e-abf6-507736556e6e",
    "fb182cb5-ca28-4182-a2bd-10dc010a77c8",
    "f8e9884d-5ace-48a7-8d56-95ff7eb6cb6e",
    "09c2ef03-9594-4ec5-a534-fd2647974bd4",
    "b099ace5-ec4a-4ebb-9f0f-d288366d9b23",
    "707e8bf9-0a6d-47e8-9fb1-a239f8f497c2",
    "24c15763-1fe0-4926-bc76-05c2fed7f512",
    "50bccef1-67cd-4587-80fc-c0af28c28af4",
    "565849c8-938e-4402-b671-407bd830f043",
]

sketchGenerator = DocSketchGenerator(15, 2 ** 16, [], 0, 0)

hashes = [sketchGenerator.get_fingerprint(id) for id in article_source_ids]
duplicate_hashes = [h for h, count in collections.Counter(hashes).items() if count > 1]
print_subtitle_1("Article source id hashes")
print(hashes)
print_subtitle_1("Duplicate elements")
print(duplicate_hashes)