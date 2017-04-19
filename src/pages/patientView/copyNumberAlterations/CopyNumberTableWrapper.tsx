import * as React from 'react';
import FeatureTitle from "shared/components/featureTitle/FeatureTitle";
import {PatientViewPageStore} from "../clinicalInformation/PatientViewPageStore";
import {observer} from "mobx-react";
import MSKTable from "shared/components/msktable/MSKTable";
import {DiscreteCopyNumberData} from "shared/api/generated/CBioPortalAPI";
import {Column} from "shared/components/msktable/MSKTable";
import * as _ from 'lodash';
import MrnaExprColumnFormatter from "../mutation/column/MrnaExprColumnFormatter";
import CohortColumnFormatter from "./column/CohortColumnFormatter";
import CnaColumnFormatter from "./column/CnaColumnFormatter";
import AnnotationColumnFormatter from "./column/AnnotationColumnFormatter";
import TumorColumnFormatter from "../mutation/column/TumorColumnFormatter";
import SampleManager from "../sampleManager";
import {IOncoKbData} from "../../../shared/model/OncoKB";
import OncoKbEvidenceCache from "../OncoKbEvidenceCache";
import PmidCache from "../PmidCache";
import {CopyNumberCount} from "../../../shared/api/generated/CBioPortalAPIInternal";
import MrnaExprRankCache from "../clinicalInformation/MrnaExprRankCache";
import {IGisticData} from "../../../shared/model/Gistic";


class CNATableComponent extends MSKTable<DiscreteCopyNumberData[]> {

}

type CNATableColumn = Column<DiscreteCopyNumberData[]>&{order:number};

type ICopyNumberTableWrapperProps = {
    sampleIds:string[];
    sampleManager:SampleManager|null;
    cnaOncoKbData?:IOncoKbData;
    oncoKbEvidenceCache?:OncoKbEvidenceCache;
    pmidCache?:PmidCache;
    data:DiscreteCopyNumberData[][];
    copyNumberCountData?:CopyNumberCount[];
    mrnaExprRankCache?:MrnaExprRankCache;
    gisticData:IGisticData;
    mrnaExprRankGeneticProfileId?:string;
    status:"loading"|"available"|"unavailable";
};


@observer
export default class CopyNumberTableWrapper extends React.Component<ICopyNumberTableWrapperProps, {}> {

    render() {
        const columns: CNATableColumn[] = [];
        const numSamples = this.props.sampleIds.length;

        if (numSamples >= 2) {
            columns.push({
                name: "Tumors",
                render:(d:DiscreteCopyNumberData[])=>TumorColumnFormatter.renderFunction(d, this.props.sampleManager),
                sortBy:(d:DiscreteCopyNumberData[])=>TumorColumnFormatter.getSortValue(d, this.props.sampleManager),
                order: 20
            });
        }

        columns.push({
            name: "Gene",
            render: (d:DiscreteCopyNumberData[])=><span>{d[0].gene.hugoGeneSymbol}</span>,
            filter: (d:DiscreteCopyNumberData[], filterString:string, filterStringUpper:string)=>{
                return d[0].gene.hugoGeneSymbol.indexOf(filterStringUpper) > -1;
            },
            download: (d:DiscreteCopyNumberData[])=>d[0].gene.hugoGeneSymbol,
            sortBy: (d:DiscreteCopyNumberData[])=>d[0].gene.hugoGeneSymbol,
            visible: true,
            order: 30
        });

        columns.push({
            name: "CNA",
            render: CnaColumnFormatter.renderFunction,
            filter: (d:DiscreteCopyNumberData[], filterString:string, filterStringUpper:string)=>{
                return CnaColumnFormatter.displayText(d).toUpperCase().indexOf(filterStringUpper) > -1;
            },
            download: CnaColumnFormatter.download,
            sortBy: CnaColumnFormatter.sortValue,
            visible: true,
            order: 40
        });

        columns.push({
            name: "Annotation",
            render: (d:DiscreteCopyNumberData[]) => (AnnotationColumnFormatter.renderFunction(d, {
                oncoKbData: this.props.cnaOncoKbData,
                oncoKbEvidenceCache: this.props.oncoKbEvidenceCache,
                pmidCache: this.props.pmidCache,
                enableOncoKb: true,
                enableMyCancerGenome: false,
                enableHotspot: false
            })),
            sortBy:(d:DiscreteCopyNumberData[])=>{
                return AnnotationColumnFormatter.sortValue(d,
                    this.props.cnaOncoKbData);
            },
            order: 50
        });

        columns.push({
            name: "Cytoband",
            render: (d:DiscreteCopyNumberData[])=><span>{d[0].gene.cytoband}</span>,
            download: (d:DiscreteCopyNumberData[])=>d[0].gene.cytoband,
            sortBy: (d:DiscreteCopyNumberData[])=>d[0].gene.cytoband,
            visible: true,
            order: 60
        });

        columns.push({
            name:"Cohort",
            render:(d:DiscreteCopyNumberData[])=>(this.props.copyNumberCountData
                ? CohortColumnFormatter.renderFunction(d,
                    this.props.copyNumberCountData,
                    this.props.gisticData)
                : (<span></span>)),
            sortBy:(d:DiscreteCopyNumberData[]) => {
                if (this.props.copyNumberCountData) {
                    return CohortColumnFormatter.getSortValue(d, this.props.copyNumberCountData);
                } else {
                    return 0;
                }
            },
            tooltip: (<span>Alteration frequency in cohort</span>),
            defaultSortDirection: "desc",
            order: 80
        });

        if ((numSamples === 1) && this.props.mrnaExprRankGeneticProfileId) {
            columns.push({
                name: "mRNA Expr.",
                render: (d:DiscreteCopyNumberData[])=>(this.props.mrnaExprRankCache
                                    ? MrnaExprColumnFormatter.cnaRenderFunction(d, this.props.mrnaExprRankCache)
                                    : (<span></span>)),
                order: 70
            });
        }

        const orderedColumns = _.sortBy(columns, (c:CNATableColumn)=>c.order);

        return (
            <div>
            {
                (this.props.status === "unavailable") && (
                    <div className="alert alert-info" role="alert">Copy Number Alterations are not available.</div>
                )
            }

            {
                (this.props.status === "available") && (
                    <CNATableComponent
                        columns={orderedColumns}
                        data={this.props.data}
                        initialSortColumn="Annotation"
                        initialSortDirection="desc"
                        initialItemsPerPage={10}
                        itemsLabel="Copy Number Alteration"
                        itemsLabelPlural="Copy Number Alterations"
                    />
                )
            }
            </div>
        );
    }
}



